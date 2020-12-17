import {app} from '../src/app'
import chai, { expect } from 'chai'
import request from 'supertest'
import { Extractor } from '../../extraction/src/extractors/extractor'
import path from 'path'
import { config } from '@fdl/config'
import ss from 'chai-subset'
chai.use(ss)

describe('downloads a series', () => {
  it('downloads a txt file to the correct location', async () => {
    const data = {
      urls: ['https://timfeid.com/test.txt'],
      year: '2001-2008',
      type: 'series',
      title: 'Californication',
      season: 1,
      episode: 2,
      blurb: 'string',
      poster: 'https://image.tmdb.org/t/p/original/9BvRze9keEyTzB6ewmDvjzFGYuG.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/9BvRze9keEyTzB6ewmDvjzFGYuG.jpg',
    }
    const response = await request(app.callback()).post('/downloads').send(data).type('json')
    expect(response.status).to.eq(200)
    let extractor: Extractor
    await new Promise(resolve => {
      // app.on('download-progress', wat => {
      //   console.log(wat)
      // })
      app.on('download-complete', (e: Extractor) => {
        extractor = e
        resolve()
      })
    })

    expect(extractor.finalItems()).to.containSubset(['test.txt'])
    expect(extractor.finalpath).to.eq(path.join(config.contentPath, 'TV Shows', data.title, `Season ${data.season.toString().padStart(2, '0')}`))
  })

  it('downloads a rar file to the correct location', async () => {
    const data = {
      urls: ['https://timfeid.com/test.rar'],
      type: 'movie',
      title: 'The Godfather',
      year: '1972',
      blurb: 'string',
      poster: 'https://image.tmdb.org/t/p/original/9BvRze9keEyTzB6ewmDvjzFGYuG.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/9BvRze9keEyTzB6ewmDvjzFGYuG.jpg',
    }
    const response = await request(app.callback()).post('/downloads').send(data).type('json')
    expect(response.status).to.eq(200)
    let extractor: Extractor
    await new Promise(resolve => {
      app.on('download-complete', (e: Extractor) => {
        extractor = e
        resolve()
      })
    })

    expect(extractor.finalItems()).to.containSubset(['test.txt'])
    expect(extractor.finalpath).to.eq(path.join(config.contentPath, 'Movies', `${data.title} (${data.year})`))
  })
})
