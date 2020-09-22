import {Download} from './download'
import { EventEmitter } from 'events'

export class Manager extends EventEmitter {
  protected downloads: Download[] = []
  protected maxDownloads: number

  constructor (maxDownloads = 8) {
    super()
    this.maxDownloads = maxDownloads
  }

  public startNextDownload () {
    const downloadingCount = this.downloads.filter(download => download.started).length
    if (!this.maxDownloads || this.maxDownloads <= 0 || downloadingCount < this.maxDownloads) {
      const nextDownload = this.downloads.find(download => !download.started)
      console.log(nextDownload)
      if (nextDownload) {
        nextDownload.start()
        this.startNextDownload()
      }
    }
  }

  public add (url: string, autoStart = false) {
    const download = new Download(url)
    download.on('complete', this.startNextDownload.bind(this))
    download.on('error', this.startNextDownload.bind(this))
    this.downloads.push(download)
    if (autoStart) {
      this.startNextDownload()
    }

    return download
  }
}
