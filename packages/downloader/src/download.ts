import { matchSite } from './sites'
import { Site } from './sites/site'
import axios from 'axios'
import { EventEmitter } from 'events'
import { matchDriver } from './drivers'
import { Driver } from './drivers/driver'
import path from 'path'
import { config } from '@fdl/config'
import {DownloadObject} from '@fdl/types'


export class Download extends EventEmitter {
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

  async start () {
    this._started = true
    try {
      this._finalUrl = await this.site.transformUrl(this.url)
      const response = await this.getHeaders()

      this._filepath = this.determineFilepath(this.determineFilename(response.headers))
      this._contentLength = parseInt(response.headers['content-length'], 10)
      this.driver = matchDriver(this, response)
      this.emit('started', this)
      await this.driver.start()
      this.emit('complete', this)
    } catch (e) {
      this.emit('error', e)
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
    this._downloaded += chunkLength
    if (this.totalProgress !== this.previousTotal || this.downloaded === this.contentLength) {
      this.previousTotal = this.totalProgress
      this.emit('progress', this)
    }
  }

  private async getHeaders () {
    return await axios({
      method: 'head',
      url: this.finalUrl,
      withCredentials: true,
      headers: {}
    })
  }

  public toObject (): DownloadObject {
    return {
      finalUrl: this.finalUrl,
      started: this.started,
      contentLength: this.contentLength,
      downloaded: this.downloaded,
      totalProgress: this.totalProgress,
    }
  }
}
