import { Downloadable, DownloadableUrl, Media } from '@fdl/data'
import EventEmitter from 'events'
import fs from 'fs'
import { ConfigService } from '../config/config.service'

export interface ExtractorTest {
  test: (files: string[]) => boolean
  class: new (
    configService: ConfigService,
    startingDirectory: string,
    files: string[],
    d: Downloadable & { media: Media; urls: DownloadableUrl[] },
  ) => Extractor
}

export abstract class Extractor extends EventEmitter {
  private _progress = 0
  private _directory: string

  constructor(
    private readonly _configService: ConfigService,
    private readonly _startingDirectory: string,
    private readonly _files: string[],
    private readonly _downloadable: Downloadable & { media: Media; urls: DownloadableUrl[] },
  ) {
    super()
  }

  get configService() {
    return this._configService
  }

  get progress() {
    return this._progress
  }

  get files() {
    return this._files
  }

  get directory() {
    return this._directory
  }

  protected abstract start(): Promise<void>

  protected setProgress(progress: number): void {
    this._progress = progress
    this.emit('progress', progress)
  }

  public async extract(directory: string): Promise<void> {
    this._directory = directory

    await this.start()
    this.setProgress(100)

    console.log('Deleting downloaded files')
    try {
      fs.rmSync(this._startingDirectory, { recursive: true, force: true })
    } catch (e) {
      console.log(e, this._startingDirectory)
    }
  }

  public finalItems(): string[] {
    return fs.readdirSync(this._directory)
  }
}
