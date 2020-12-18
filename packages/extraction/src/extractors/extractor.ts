import {Download} from '@fdl/downloader'
import { DownloadInfo } from '@fdl/types'
import finalpath from '../finalpath'
import fs from 'fs'
import {EventEmitter} from 'events'

export abstract class Extractor extends EventEmitter {
  protected info: DownloadInfo
  protected _finalpath: string
  protected _progress = 0
  protected _complete = false
  protected _deleteAfterDownload = false
  constructor (info: DownloadInfo) {
    super()
    this.info = info
    this._finalpath = finalpath(info)
  }

  get finalpath (): string {
    return this._finalpath
  }

  get progress (): number {
    return this._progress
  }

  get complete (): boolean {
    return this._complete
  }

  get deleteAfterDownload(): boolean {
    return this._deleteAfterDownload
  }

  protected abstract async start (downloads: Download[]): Promise<void>

  protected createFinalpath (): void {
    fs.mkdirSync(this.finalpath, {recursive: true})
  }

  protected setProgress (progress: number): void {
    this._progress = progress
    this.emit('progress', progress)
  }

  public async extract (downloads: Download[]): Promise<void> {
    await this.createFinalpath()
    await this.start(downloads)
    this.setProgress(100)
    this._complete = true
    this.emit('complete')
  }

  public finalItems (): string[] {
    return fs.readdirSync(this.finalpath)
  }
}

export type Validator = (downloads: Download[]) => boolean
