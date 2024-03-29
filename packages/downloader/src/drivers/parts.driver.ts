import { config } from '@fdl/config'
import { logger } from '@fdl/logger'
import axios, { AxiosResponse, CancelTokenSource } from 'axios'
import { EventEmitter } from 'events'
import fs from 'fs'
import md5 from 'md5'
// eslint-disable-next-line
// @ts-ignore
import Multistream from 'multistream'
import path from 'path'
import { Stream } from 'stream'
import { Download } from '../download'
import { Driver, Validator } from './driver'

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
  lastReceivedData = Date.now()
  livenessCheckTimeout: NodeJS.Timeout
  isComplete = false
  last = 0
  constructor (part: Part) {
    super()
    this.part = part
    logger.verbose(`created part ${part.file}, ${part.partNumber}`)
  }

  async download () {
    logger.debug(`download called for ${this.part.parts.download.originalUrl} part ${this.part.partNumber}`)
    let filesize = fs.existsSync(this.part.file) ? fs.statSync(this.part.file).size : 0
    this.gotData()
    clearTimeout(this.livenessCheckTimeout)

    if (filesize > 0) {
      logger.debug('we are continuing a download')
      this.emit('progress', filesize)
    }

    if (filesize === this.part.contentLength) {
      logger.debug('this part is already completed')
      return this.completed()
    }

    if (filesize > this.part.contentLength) {
      logger.error('we have filesize larger than we should, restarting')
      fs.unlinkSync(this.part.file)
      filesize = 0
    }

    this.livenessCheck()

    try {
      this.request = await this.createRequest(filesize + this.part.from)
      logger.debug(`started request for ${this.part.parts.download.originalUrl} part ${this.part.partNumber}`)
      this.createPipe()
    } catch (e) {
      logger.debug(`error for ${this.part.parts.download.originalUrl} part ${this.part.partNumber}`)
      this.error(e)
    }
  }

  createRequest (from: number) {
    this.cancelToken = axios.CancelToken.source()

    return axios({
      method: 'get',
      cancelToken: this.cancelToken.token,
      responseType: 'stream',
      url: this.part.parts.download.finalUrl,
      headers: {
        Range: `bytes=${from}-${this.part.to}`
      }
    })
  }

  createStream () {
    return fs.createWriteStream(this.part.file, fs.existsSync(this.part.file) ? {flags: 'a'} : {})
  }

  createPipe () {
    const stream = this.createStream()
    stream.on('finish', this.completed.bind(this))
    stream.on('error', this.error.bind(this))
    this.request.data.on('data', this.progress.bind(this))
    this.request.data.pipe(stream)
  }

  error (e: any) {
    logger.error(e)
    clearTimeout(this.livenessCheckTimeout)
    this.part.parts.download.restart()
  }

  completed () {
    const filesize = fs.existsSync(this.part.file) ? fs.statSync(this.part.file).size : 0
    // keep the timeout going if we're not at the correct size
    if (filesize === this.part.contentLength) {
      logger.verbose('completed')
      clearTimeout(this.livenessCheckTimeout)
      if (!this.isComplete) {
        this.isComplete = true
        this.emit('complete')
      }
    }
  }

  progress (chunk: Buffer) {
    this.gotData()
    this.emit('progress', chunk)
    const p = Math.round(this.part.downloaded / this.part.contentLength * 100)
    if (p !== this.last) {
      this.last = p
      if (p % 25 === 0) {
        logger.verbose(`${this.part.file} is ${p}% complete`)
      }
    }
  }

  gotData () {
    this.lastReceivedData = Date.now()
  }

  cancel (reason: string) {
    if (this.cancelToken) {
      this.cancelToken.cancel(reason)
    }
  }

  livenessCheck () {
    if (Date.now() - this.lastReceivedData > 30000) {
      logger.debug(`${this.part.file} may have stalled, restarting.`)
      this.cancel('Restarting due to inactivity')
      this.download()
    }
    clearTimeout(this.livenessCheckTimeout)
    this.livenessCheckTimeout = setTimeout(this.livenessCheck.bind(this), 30000)
  }
}

class Part extends EventEmitter {
  parts: Parts
  partNumber: number
  equalBytes: number
  file: string
  downloader: DownloadPart
  downloaded = 0
  constructor (parts: Parts, partNumber: number, tempName: string) {
    super()
    this.parts = parts
    this.partNumber = partNumber
    this.equalBytes = Math.floor(parts.download.contentLength / TOTAL_PARTS)
    this.file = path.join(config.tempPath, `${tempName}.part.${this.partNumber+1}`)
  }

  get contentLength () {
    return this.to - this.from + 1 // inclusive
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
    return this.partNumber === TOTAL_PARTS-1 ? this.parts.download.contentLength - 1 /* 0 is the first byte */ : (this.partNumber+1) * this.equalBytes
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
    this.downloaded = this.contentLength
    this.progress(0)
    logger.verbose(`Completed part ${this.file}`)
    this.emit('complete')
  }


  download () {
    this.downloaded = 0
    this.downloader = new DownloadPart(this)
    this.downloader.on('complete', this.completed.bind(this))
    this.downloader.on('progress', this.progress.bind(this))
    this.downloader.download()
  }

  cancel (reason = 'Cancelled') {
    this.downloaded = 0
    if (this.downloader) {
      this.downloader.cancel(reason)
    }
  }
}

export default class Parts extends Driver {
  parts: Part[] = []
  tempName: string
  maxTries = 3
  tries = 0

  constructor (download: Download) {
    super(download)
    this.tempName = md5(download.originalUrl).substr(0, 10)
    logger.verbose(`parts driver initiated for ${download.originalUrl}`)
  }

  async start () {
    if (!this.parts.length) {
      this.createParts()
    }

    // await this.parts[0].download()
    try {
      await Promise.all(this.parts.map(part => new Promise(resolve => {
        part.on('complete', resolve)
        logger.debug(`started downloading part ${part.partNumber} for ${part.parts.download.originalUrl}`)
        part.download()
      })))
    } catch (e) {
      logger.error('something went wrong in parts.start. going to restart')
      if (++this.tries !== this.maxTries) {
        this.start()
      }
      console.log(e)
    }
    await this.joinParts()
    await this.destroyParts()
  }

  cancel (reason = 'Cancelled') {
    this.parts.forEach(part => part.cancel(reason))
    return true
  }

  private createParts () {
    for (let i = 0;i < TOTAL_PARTS; i++) {
      logger.debug(`created part ${i} for ${this.download.originalUrl}`)
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
