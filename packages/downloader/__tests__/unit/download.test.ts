import { Download } from '../../src/download'
import fs from 'fs'
import childProcess from 'child_process'

describe('download', () => {
  let finalResult = ''

  beforeAll(() => {
    finalResult = fs.readFileSync(`${__dirname}/../test-download-data/test.txt`).toString('utf-8')
  })

  it('downloads in parts', async () => {
    const download = new Download('https://timfeid.com/test.txt', {
      tempDir: `${__dirname}/../test-download-data`,
      downloadDir: `${__dirname}/../test-download-data`,
    })

    await download.start()
  })

  it('downloads in parts', async () => {
    const download = new Download('https://timfeid.com/test.txt', {
      tempDir: `${__dirname}/../test-download-data/from-empty`,
      downloadDir: `${__dirname}/../test-download-data/from-empty`,
    })

    await download.start()

    expect(fs.readFileSync(download.filePath).toString('utf-8')).toBe(finalResult)

    fs.unlinkSync(download.filePath)
  })

  it('resumes downloading', async () => {
    const download = new Download('https://timfeid.com/test.txt', {
      tempDir: `${__dirname}/../test-download-data/from-partial`,
      downloadDir: `${__dirname}/../test-download-data/from-partial`,
    })

    // move "unfinished" temp files to the temp dir so we don't have to recreate them every time
    childProcess.execSync(
      `cp -r ${__dirname}/../test-download-data/from-partial/temp-files/* ${__dirname}/../test-download-data/from-partial`,
    )

    await download.start()

    expect(fs.readFileSync(download.filePath).toString('utf-8')).toBe(finalResult)

    fs.unlinkSync(download.filePath)
  })
})
