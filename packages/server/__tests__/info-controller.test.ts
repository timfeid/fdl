import {app} from '../src/app'
import chai, { expect } from 'chai'
import request from 'supertest'
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
    const response = await request(app.callback()).get(`/info/imdb/${query}`).type('json')
    expect(response.status).to.eq(200)
    expect(response.body).to.containSubset({
      title: 'The Bellwether',
      year: '2018',
    })
  })

  it('can look up imdb with season', async () => {
    const query = 'tt7423538'
    const response = await request(app.callback()).get(`/info/imdb/${query}?name=Ratched.S01.1080p.NF.WEBRip.DDP5.1.x264-NTb`).type('json')
    expect(response.status).to.eq(200)
    expect(response.body).to.containSubset({
      type: {name: 'series'},
      title: 'Ratched',
      season: 1,
    })
  })

  it('can search tv shows', async () => {
    const query = 'South Park'
    const response = await request(app.callback()).get(`/info/search/?query=${query}`).type('json')
    expect(response.status).to.eq(200)
    expect(response.body).to.containSubset([
      {
        name: 'South Park',
        firstAirDate: '1997-08-13',
        type: 'series',
      },
    ])
  })

  it('can search movies', async () => {
    const query = 'King of California'
    const response = await request(app.callback()).get(`/info/search/?query=${query}`).type('json')
    expect(response.status).to.eq(200)
    expect(response.body).to.containSubset([
      {
        name: 'King of California',
        firstAirDate: '2007',
        type: 'movie',
      },
    ])
  })

  it('can get a series', async () => {
    const query = '2190'
    const response = await request(app.callback()).get(`/info/series/${query}`).type('json')
    expect(response.status).to.eq(200)
    expect(response.body).to.containSubset({
      name: 'South Park',
    })
  })

  it('can get a series season', async () => {
    const query = '2190'
    const response = await request(app.callback()).get(`/info/series/${query}/0`).type('json')
    expect(response.status).to.eq(200)
    expect(response.body).to.containSubset({
      season_number: 0,
    })
  })
})
