import { expect } from 'chai'
import path from 'path'
import finalpath from '../src/finalpath'
import { DownloadInfo } from '../../server/src'
import { config } from '../../config/src'

describe('finalpath', () => {
  it('gets movie final path correctly', async () => {
    const data: DownloadInfo = {
      type: 'movie',
      title: 'The Godfather',
      year: '1972',
      urls: [],
    }
    const fp = finalpath(data)

    expect(fp).to.eq(path.join(config.contentPath, 'Movies', `${data.title} (${data.year})`))

  })

  it('gets movie final path correctly', async () => {
    const data: DownloadInfo = {
      type: 'series',
      title: 'Californication',
      year: '2005-2010',
      urls: [],
      season: 3,
      episode: {
        number: 5,
        airDate: '2005-01-02',
      },
    }
    const fp = finalpath(data)

    expect(fp).to.eq(path.join(config.contentPath, 'TV Shows', data.title, `Season ${data.season.toString().padStart(2, '0')}`))

  })
})
