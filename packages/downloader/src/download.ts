import { findWebsite } from './site'
import { Site } from './site/site'
import { EventEmitter } from 'events'
import axios from 'axios'
import path from 'path'
import { DownloadInParts } from './driver/download-in-parts'
import fs from 'fs'

type DownloadOptions = {
  tempDir?: string
  downloadDir?: string
}

export class Download extends EventEmitter {
  private readonly _tempDir: string
  private readonly _downloadDir: string

  private site: Site
  private started = false
  private _filePath = ''
  private _contentLength = 1
  private _url: string
  private _bytesDownloaded = 0
  private lastEmittedProgress = 0

  get filePath() {
    return this._filePath
  }

  get url() {
    return this._url
  }

  get contentLength() {
    return this._contentLength
  }

  get tempDir() {
    return this._tempDir
  }

  constructor(public readonly originalUrl: string, { tempDir, downloadDir }: DownloadOptions = {}) {
    super()
    this.site = findWebsite(this.originalUrl)
    this._downloadDir = downloadDir || './'
    this._tempDir = tempDir || './'

    console.log(this.tempDir, this._downloadDir)
  }

  progress(chunk: Buffer | number) {
    const addedBytes = typeof chunk === 'number' ? chunk : chunk.length
    this._bytesDownloaded += addedBytes
    const p = Math.round((this._bytesDownloaded / this.contentLength) * 100)

    if (p !== this.lastEmittedProgress) {
      this.lastEmittedProgress = p
      console.log(`download progress: ${p}% complete`)
    }
  }

  async start() {
    if (this.started) {
      return console.log('this download is already started')
    }

    this.started = true
    this._url = await this.site.transformUrl(this.originalUrl)
    await this.getFileInfo()

    if (fs.existsSync(this.filePath)) {
      return console.log('this file already exists, assuming complete')
    }

    const downloadInParts = new DownloadInParts(this)
    return await downloadInParts.start()
  }

  private async getFileInfo() {
    const headers = await this.getHeaders()
    this._contentLength = parseInt(headers.headers['content-length'], 10)
    this._filePath = path.join(
      this._downloadDir,
      this.filename(headers.headers['content-disposition']),
    )
  }

  private filename(disposition?: string) {
    if (disposition) {
      const matches = disposition.match(/filename="([^"]+)"/)
      if (matches) {
        return matches[1]
      }
    }

    const dirs = new URL(this._url).pathname.split('/')

    return dirs[dirs.length - 1]
  }

  private async getHeaders() {
    console.log(`Getting headers for ${this.originalUrl}`)
    try {
      return await axios({
        method: 'head',
        url: this._url,
        withCredentials: true,
        headers: {},
      })
    } catch (e) {
      console.error(e)
    }
  }
}
