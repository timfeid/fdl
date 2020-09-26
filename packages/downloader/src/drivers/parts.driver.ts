import { Validator, Driver } from './driver'
import axios, { AxiosResponse, CancelTokenSource } from 'axios'
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

class Part extends EventEmitter {
  parts: Parts
  partNumber: number
  totalBytes: number
  file: string
  downloaded = 0
  lastReceivedData = 0
  request: AxiosResponse<Stream>
  cancelToken: CancelTokenSource
  dataCheckTimeout: NodeJS.Timeout
  constructor (parts: Parts, partNumber: number, tempName: string) {
    super()
    this.parts = parts
    this.partNumber = partNumber
    this.totalBytes = Math.floor(parts.download.contentLength / TOTAL_PARTS)
    this.file = path.join(config.tempPath, `${tempName}.part.${this.partNumber+1}`)
  }

  get from () {
    // part number 0 = 0 * 50 = 0
    // part number 1 = 1 * 50 + 1 = 51
    // part number 2 = 2 * 50 + 1= 101
    return this.partNumber ? (this.partNumber * this.totalBytes) + 1 : 0
  }

  get to () {
    // part number 0 = (0+1) * 50 = 50
    // part number 1 = (1+1) * 50 = 100
    // part number 2 = (2+1) * 50 = 150
    return this.partNumber === TOTAL_PARTS-1 ? this.parts.download.contentLength : (this.partNumber+1) * this.totalBytes
  }

  error (e: Error) {
    logger.error(e)
    logger.debug(this)
    this.parts.download.emit('error', e)
  }

  progress (chunk: Buffer | number) {
    const totalProgress = typeof chunk === 'number' ? chunk : chunk.length
    this.gotData()
    this.downloaded += totalProgress
    this.parts.download.progress(totalProgress)
  }

  completed () {
    logger.verbose(`Completed part ${this.file}`)
    clearTimeout(this.dataCheckTimeout)
    this.emit('completed')
  }

  gotData () {
    this.lastReceivedData = Date.now()
  }

  async downloadRequest (from: number) {
    this.cancelToken = axios.CancelToken.source()
    return axios({
      method: 'get',
      cancelToken: this.cancelToken.token,
      responseType: 'stream',
      url: this.parts.download.finalUrl,
      headers: {
        Range: `bytes=${from}-${this.to}`
      }
    })
  }

  async pipeData () {
    const stream = fs.createWriteStream(this.file, fs.existsSync(this.file) ? {flags: 'a'} : {})
    const filesize = fs.existsSync(this.file) ? fs.statSync(this.file).size : 0
    const from = this.from + filesize
    if (from < this.to) {
      this.request = await this.downloadRequest(from)
      this.request.data.on('data', this.progress.bind(this))
      this.request.data.on('end', this.completed.bind(this))
      this.request.data.on('error', this.error.bind(this))
      this.request.data.pipe(stream)
    } else {
      this.progress(filesize)
      this.completed()
    }
  }

  async dataCheck () {
    if (Date.now() - this.lastReceivedData > 10000) {
      logger.debug(`${this.file} may have stalled, restarting.`)
      this.cancelToken.cancel('Restarting due to inactivity.')
      this.pipeData()
    }
    this.dataCheckTimeout = setTimeout(this.dataCheck.bind(this), 10000)
  }

  async download () {
    try {
      return await new Promise((resolve) => {
        this.on('completed', resolve)
        this.gotData()
        this.dataCheck()
        this.pipeData()
      })

    } catch (e) {
      this.error(e)
      logger.error(e)
    }
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
    await Promise.all(this.parts.map(async p => await p.download()))
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
}

export const validator: Validator = (response) => response.headers['accept-ranges'] === 'bytes'
