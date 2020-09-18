import {app} from '../src/app'
import chai, { expect } from 'chai'
import request from 'supertest'
import { Extractor } from '../../extraction/src/extractors/extractor'
import path from 'path'
import { config } from '@fdl/config'
import ss from 'chai-subset'
chai.use(ss)

describe('info controller', () => {
  it('can look up tv seasons', async () => {
    const query = 'South.Park.S23.1080p.HDTV.x264-CRAVERS ~ 32.2 GB'
    const response = await request(app.callback()).get(`/info/tv-shows?query=${query}`).type('json')
    expect(response.status).to.eq(200)
    expect(response.body).to.containSubset({
      title: 'South Park',
      season: 23,
      episode: null,
    })
  })
  it('can look up tv episodes', async () => {
    const query = 'South.Park.S23E01.1080p.HDTV.x264-CRAVERS ~ 32.2 GB'
    const response = await request(app.callback()).get(`/info/tv-shows?query=${query}`).type('json')
    expect(response.status).to.eq(200)
    expect(response.body).to.containSubset({
      title: 'South Park',
      season: 23,
      episode: 1,
    })
  })

  it('can look up movies', async () => {
    const query = 'tt6269308'
    const response = await request(app.callback()).get(`/info/movies?imdb=${query}`).type('json')
    expect(response.status).to.eq(200)
    expect(response.body).to.containSubset({
      title: 'The Bellwether',
      year: '2018',
    })
  })
})
