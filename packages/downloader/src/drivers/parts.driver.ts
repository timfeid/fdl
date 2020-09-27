import { Validator, Driver } from './driver'
import axios, { AxiosPromise, AxiosResponse, CancelTokenSource } from 'axios'
import fs from 'fs'
import { EventEmitter } from 'events'
import path from 'path'
// eslint-disable-next-line
// @ts-ignore
import Multistream from 'multistream'
import { config } from '@fdl/config'
import { Download } from '../download'
import md5 from 'md5'
import { Stream } from 'stream'
import { logger } from '@fdl/logger'

const TOTAL_PARTS = 8

function mergeFiles(readFiles: string[], writeFile: string): Promise<boolean> {
  const fd = fs.openSync(writeFile, 'w+')
  const output = fs.createWriteStream(writeFile)
  const inputList = readFiles.map(path => fs.createReadStream(path))

  return new Promise((resolve, reject) => {
    const multiStream = new Multistream(inputList)
    multiStream.pipe(output)
    multiStream.on('end', () => {
      fs.closeSync(fd)
      resolve(true)
    })
    multiStream.on('error', () => {
      fs.closeSync(fd)
      reject(false)
    })
  })
}

class DownloadPart extends EventEmitter {
  part: Part
  request: AxiosResponse<Stream>
  cancelToken: CancelTokenSource
  filesize = 0
  lastReceivedData = Date.now()
  livenessCheckTimeout: NodeJS.Timeout
  constructor (part: Part) {
    super()
    this.part = part
  }

  refreshFilesize () {
    this.filesize = fs.existsSync(this.part.file) ? fs.statSync(this.part.file).size : 0
  }

  async download () {
    this.refreshFilesize()
    if (this.filesize === this.part.contentLength) {
      return this.completed()
    }
    this.cancelToken = axios.CancelToken.source()
    this.request = await this.createRequest(this.part.from + this.filesize)
    this.createPipe()
    this.livenessCheck()
  }

  createRequest (from: number): Promise<AxiosResponse<Stream>> {
    return new Promise(resolve => {
      axios({
        method: 'get',
        cancelToken: this.cancelToken.token,
        responseType: 'stream',
        url: this.part.parts.download.finalUrl,
        headers: {
          Range: `bytes=${from}-${this.part.to}`
        }
      }).then(resolve).catch(() => setTimeout(() => resolve(this.createRequest(from)), 1000))
    })
  }

  createStream () {
    return fs.createWriteStream(this.part.file, fs.existsSync(this.part.file) ? {flags: 'a'} : {})
  }

  createPipe () {
    const stream = this.createStream()
    stream.on('finish', this.completed.bind(this))
    stream.on('error', this.download.bind(this))
    this.request.data.on('data', this.progress.bind(this))
    this.request.data.pipe(stream)
  }

  completed () {
    clearTimeout(this.livenessCheckTimeout)
    this.emit('complete')
  }

  progress (chunk: Buffer) {
    this.gotData()
    this.emit('progress', chunk)
  }

  gotData () {
    this.lastReceivedData = Date.now()
  }

  livenessCheck () {
    if (Date.now() - this.lastReceivedData > 10000) {
      logger.debug(`${this.part.file} may have stalled, restarting.`)
      this.cancelToken.cancel('Restarting due to inactivity.')
      this.download()
    }
    this.livenessCheckTimeout = setTimeout(this.livenessCheck.bind(this), 10000)
  }
}

class Part extends EventEmitter {
  parts: Parts
  partNumber: number
  equalBytes: number
  file: string
  downloaded = 0
  constructor (parts: Parts, partNumber: number, tempName: string) {
    super()
    this.parts = parts
    this.partNumber = partNumber
    this.equalBytes = Math.floor(parts.download.contentLength / TOTAL_PARTS)
    this.file = path.join(config.tempPath, `${tempName}.part.${this.partNumber+1}`)
  }

  get contentLength () {
    return this.to - this.from
  }

  get from () {
    // part number 0 = 0 * 50 = 0
    // part number 1 = 1 * 50 + 1 = 51
    // part number 2 = 2 * 50 + 1= 101
    return this.partNumber ? (this.partNumber * this.equalBytes) + 1 : 0
  }

  get to () {
    // part number 0 = (0+1) * 50 = 50
    // part number 1 = (1+1) * 50 = 100
    // part number 2 = (2+1) * 50 = 150
    return this.partNumber === TOTAL_PARTS-1 ? this.parts.download.contentLength : (this.partNumber+1) * this.equalBytes
  }

  // error (e: Error) {
  //   logger.error(e)
  //   logger.debug(this)
  //   this.parts.download.emit('error', e)
  // }

  progress (chunk: Buffer | number) {
    const totalProgress = typeof chunk === 'number' ? chunk : chunk.length
    this.downloaded += totalProgress
    this.parts.download.progress(totalProgress)
  }

  completed () {
    this.downloaded = this.from - this.to
    logger.verbose(`Completed part ${this.file}`)
    this.emit('completed')
  }


  download () {
    const downloader = new DownloadPart(this)
    downloader.on('complete', this.completed.bind(this))
    downloader.on('progress', this.progress.bind(this))
    downloader.download()
  }
}

export default class Parts extends Driver {
  parts: Part[] = []
  tempName: string

  constructor (download: Download) {
    super(download)
    this.tempName = md5(download.originalUrl).substr(0, 10)
  }

  async start () {
    this.createParts()

    // await this.parts[0].download()
    await Promise.all(this.parts.map(part => new Promise(resolve => {
      part.download()
      part.on('complete', resolve)
    })))
    await this.joinParts()
    await this.destroyParts()
  }

  private createParts () {
    for (let i = 0;i < TOTAL_PARTS; i++) {
      this.parts.push(new Part(this, i, this.tempName))
    }
  }

  private destroyParts () {
    this.parts.map(p => fs.unlinkSync(p.file))
  }

  private async joinParts () {
    await mergeFiles(this.parts.map(p => p.file), this.download.filepath)
  }

  toObject () {
    return {
      parts: this.parts.map(part => ({
        progress: Math.round(part.downloaded / part.contentLength * 100)
      }))
    }
  }
}

export const validator: Validator = (response) => response.headers['accept-ranges'] === 'bytes'
