import { matchSite } from './sites'
import { Site } from './sites/site'
import axios from 'axios'
import { EventEmitter } from 'events'
import { matchDriver } from './drivers'
import { Driver } from './drivers/driver'
import path from 'path'
import { config } from '@fdl/config'
import {DownloadObject} from '@fdl/types'
import {logger} from '@fdl/logger'
import fs from 'fs'

export class Download extends EventEmitter {
  readonly MAX_RETRIES = 3
  readonly RETRY_DELAY = 30
  private url: string
  private _finalUrl?: string
  private site: Site
  private _started = false
  private _filepath?: string
  private _contentLength?: number
  private driver?: Driver
  private _downloaded = 0
  private basepath = config.downloadPath
  private previousTotal = 0
  private retryCount = 0
  private _completed = false
  private retryAfter: number
  private retryTimeout: NodeJS.Timeout

  public get originalUrl () {
    return this.url
  }

  public get completed () {
    return this._completed
  }

  public get contentLength () {
    return this._contentLength
  }

  public get finalUrl () {
    return this._finalUrl
  }

  public get filepath () {
    return this._filepath
  }

  public get started () {
    return this._started
  }

  public get downloaded () {
    return this._downloaded
  }

  public get totalProgress () {
    return Math.round(this.downloaded / this.contentLength * 100)
  }

  constructor (url: string) {
    super()
    this.url = url
    this.site = matchSite(url)
  }

  complete () {
    logger.verbose(`Completed download ${this.filepath}`)
    this._completed = true
    this.emit('complete')
  }

  restart () {
    clearTimeout(this.retryTimeout)

    if (this.retryCount++ !== this.MAX_RETRIES) {
      logger.info(`Restarting in ${this.RETRY_DELAY} seconds`)

      setTimeout(() => this.start(), this.RETRY_DELAY * 1000)
    }
  }

  checkForRestart () {
    let restarted = false
    if (this.retryAfter < Date.now()) {
      this.restart()
      restarted = true
      logger.info('We are restarting due to header or transform url timeout')
    }
    if (!this._completed && !restarted) {
      this.retryTimeout = setTimeout(this.checkForRestart.bind(this), 30000)
    }
  }

  changed () {
    this.retryAfter = Date.now() + 25000
  }

  async start () {
    this._started = true
    this.changed()
    this.checkForRestart()
    if (this.retryCount > 0) {
      logger.info(`Retry #${this.retryCount}`)
    }
    try {
      this._finalUrl = await this.site.transformUrl(this.url)
      this.changed()
    } catch (e) {
      console.error(e)
      return this.restart()
    }

    try {
      const response = await this.getHeaders()
      // we made it to the download portion which has its own retry policy
      clearTimeout(this.retryTimeout)

      this._filepath = this.determineFilepath(this.determineFilename(response.headers))
      this._contentLength = parseInt(response.headers['content-length'], 10)
      const filesize = fs.existsSync(this._filepath) ? fs.statSync(this._filepath).size : 0
      this.emit('started', this)
      this.progress(filesize)
      if (filesize !== this._contentLength) {
        this.driver = matchDriver(this, response)
        logger.verbose('matched driver')
        this.changed()
        await this.driver.start()
      }
      this.complete()
    } catch (e) {
      console.error(e)
      this.restart()
    }
  }

  public setBasepath (basepath: string) {
    this.basepath = basepath

    return this
  }

  private determineFilepath (filename: string) {
    return path.join(this.basepath, filename)
  }

  private determineFilename (headers: Record<string, string>) {
    const disposition: string = headers['content-disposition']

    if (disposition) {
      const matches = disposition.match(/filename="([^"]+)"/)
      if (matches) {
        return matches[1]
      }
    }

    const dirs = new URL(this.url).pathname.split('/')

    return dirs[dirs.length-1]
  }

  public progress(chunkLength: number) {
    this.changed()

    this._downloaded += chunkLength
    if (this.totalProgress !== this.previousTotal || this.downloaded === this.contentLength) {
      this.previousTotal = this.totalProgress
      this.emit('progress', this)
    }
    if (this.downloaded === this.contentLength) {
      console.log('downloading complete for', this.originalUrl)
      this.emit('downloading-complete')
    }
  }

  private async getHeaders () {
    logger.verbose(`Getting headers for ${this.originalUrl}`)
    try {

      return await axios({
        method: 'head',
        url: this.finalUrl,
        withCredentials: true,
        headers: {}
      })
    } catch (e) {
      console.error(e)
      this.restart()
    }
  }

  public toObject (): DownloadObject {
    return {
      finalUrl: this.finalUrl,
      started: this.started,
      contentLength: this.contentLength,
      downloaded: this.downloaded,
      totalProgress: this.totalProgress,
      originalUrl: this.originalUrl,
      driver: this.driver ? this.driver.toObject() : undefined,
    }
  }
}
