import Download from "@fdl/downloader";
import { DownloadInfo } from "@fdl/server";
import finalpath from "../finalpath";
import fs from 'fs'

export abstract class Extractor {
  protected info: DownloadInfo
  protected _finalpath: string
  constructor (info: DownloadInfo) {
    this.info = info
    this._finalpath = finalpath(info)
  }

  get finalpath () {
    return this._finalpath
  }

  protected abstract async start (downloads: Download[]): Promise<void>

  protected createFinalpath () {
    fs.mkdirSync(this.finalpath, {recursive: true})
  }

  public async extract (downloads: Download[]) {
    await this.createFinalpath()
    await this.start(downloads)
  }

  finalItems () {
    return fs.readdirSync(this.finalpath)
  }
}

export type Validator = (downloads: Download[]) => boolean
