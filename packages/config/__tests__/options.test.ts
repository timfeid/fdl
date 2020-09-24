import { expect } from 'chai'
import { getOption, saveOption } from '@fdl/config'
import { Option } from '@fdl/data'

describe('downloads a series', () => {
  before (async () => {
    await Option.delete({})
  })

  it('can get maxDownloads', async () => {
    const maxDownloads = 8

    expect(await getOption('maxDownloads')).to.eq(maxDownloads)
  })

  it('can get deleteAfterDownload', async () => {
    const deleteAfterDownload = true

    expect(await getOption('deleteAfterDownload')).to.eq(deleteAfterDownload)
  })

  it('can save maxDownloads', async () => {
    await saveOption('maxDownloads', 15)

    expect(await getOption('maxDownloads')).to.eq(15)
  })

  it('can save deleteAfterDownload', async () => {
    await saveOption('deleteAfterDownload', false)

    expect(await getOption('deleteAfterDownload')).to.eq(false)
  })
})
