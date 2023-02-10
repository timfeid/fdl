import axios from 'axios'
import { DownloadInParts } from './download-in-parts'
import fs from 'fs'

export class Part {
  private bytesDownloaded = 0
  private lastProgressPercentage = 0

  constructor(
    private readonly downloadInParts: DownloadInParts,
    private readonly _filepath: string,
    private readonly from: number,
    private readonly to: number,
  ) {}

  get filepath() {
    return this._filepath
  }

  get contentLength() {
    return this.to - this.from + 1 // inclusive
  }

  get startingFileSize() {
    return fs.existsSync(this.filepath) ? fs.statSync(this.filepath).size : 0
  }

  createStream() {
    return fs.createWriteStream(
      this.filepath,
      this.startingFileSize > 0 ? { flags: 'a', start: this.startingFileSize } : {},
    )
  }

  progress(chunk: Buffer | number) {
    const addedBytes = typeof chunk === 'number' ? chunk : chunk.length
    this.downloadInParts.download.progress(chunk)
    this.bytesDownloaded += addedBytes
    const p = Math.round((this.bytesDownloaded / this.contentLength) * 100)
    if (p !== this.lastProgressPercentage) {
      this.lastProgressPercentage = p
      console.log(`${this.filepath} is ${p}% complete`)
    }
  }

  createRequest() {
    const from = this.startingFileSize + this.from

    console.log('requesting bytes', `bytes=${from}-${this.to}`)

    return axios.get(this.downloadInParts.download.url, {
      // cancelToken: this.cancelToken.token,
      responseType: 'stream',
      headers: {
        Range: `bytes=${from}-${this.to}`,
      },
    })
  }

  async start() {
    const filesize = this.startingFileSize
    this.progress(filesize)

    if (filesize === this.contentLength) {
      return console.log('this part is already complete?')
    }

    const stream = this.createStream()
    const request = await this.createRequest()

    request.data.on('data', this.progress.bind(this))
    request.data.pipe(stream)

    return new Promise(resolve => {
      stream.on('finish', resolve)
    })
  }
}
