import md5 from 'md5'
import { Download } from '../download'
import { Part } from './part'
import childProcess from 'child_process'
import path from 'path'

export class DownloadInParts {
  private readonly TOTAL_PARTS = 8
  private readonly tempName: string
  private readonly equalBytes: number
  private readonly parts: Part[] = []

  private started = false

  constructor(private readonly _download: Download) {
    this.tempName = md5(this.download.originalUrl).substring(0, 10)
    this.equalBytes = Math.floor(this.download.contentLength / this.TOTAL_PARTS)

    for (let i = 0; i < this.TOTAL_PARTS; i++) {
      const from = this.getFrom(i)
      const to = this.getTo(i)
      const filepath = this.getTemporaryFilepath(i)
      const part = new Part(this, filepath, from, to)
      this.parts.push(part)
    }
  }

  get download() {
    return this._download
  }

  async start() {
    if (this.started) {
      return console.log('already started')
    }

    this.started = true

    await Promise.all(
      this.parts.map(async part => {
        await part.start()
      }),
    )

    const fileList = this.parts.map(part => `"${part.filepath}"`).join(' ')
    childProcess.execSync(`cat ${fileList} > "${this.download.filePath}"`)
    childProcess.execSync(`rm -f ${fileList}`)
  }

  getFrom(partNumber: number) {
    // part number 0 = 0 * 50 = 0
    // part number 1 = 1 * 50 + 1 = 51
    // part number 2 = 2 * 50 + 1= 101
    return partNumber ? partNumber * this.equalBytes + 1 : 0
  }

  getTo(partNumber: number) {
    // part number 0 = (0+1) * 50 = 50
    // part number 1 = (1+1) * 50 = 100
    // part number 2 = (2+1) * 50 = 150
    return partNumber === this.TOTAL_PARTS - 1
      ? this.download.contentLength - 1 /* 0 is the first byte */
      : (partNumber + 1) * this.equalBytes
  }

  // allow string for cat wildcard
  getTemporaryFilepath(partNumber: number | string) {
    return path.join(this.download.tempDir, `${this.tempName}.part.${partNumber}`)
  }
}
