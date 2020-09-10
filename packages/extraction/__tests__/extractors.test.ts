import chai, { expect } from "chai"
import path from 'path'
import finalpath from "../src/finalpath"
import { DownloadInfo } from "../../server/src"
import { config } from "../../config/src"
import RarExtractor from "../src/extractors/rar.extractor"
import Download from "../../downloader/src"
import ss from 'chai-subset'
chai.use(ss)

describe('extractors', () => {
  it('extracts a movie', async () => {
    const data: DownloadInfo = {
      type: 'movie',
      title: 'The Matrix',
      year: '1999',
      urls: [],
    }
    const download = new Download('')
    // @ts-ignore
    download._filepath = path.join(__dirname, 'test.rar')
    const rar = new RarExtractor(data)
    await rar.extract([download])

    expect(rar.finalItems()).to.containSubset(['test.txt'])
    expect(rar.finalpath).to.eq(path.join(config.contentPath, 'Movies', `${data.title} (${data.year})`))

  })
})
