import chai, { expect } from 'chai'
import { getInfo } from '../src/imdb'
import { search, parseTitle } from '../src/moviedb'
import chaiSubset from 'chai-subset'

chai.use(chaiSubset)

describe('gets information about movies/shows', () => {
  it('tv from imdb', async () => {
    const info = await getInfo('tt1986770')

    expect(info).to.not.be.null
    expect(info).to.have.property('type').to.eq('series')
    expect(info).to.have.property('year').to.eq('2012–2014')
    expect(info).to.have.property('title').to.eq('Anger Management')
  })

  it('search the moviedb', async () => {
    const results = await search('Californication')

    expect(results).to.containSubset([
      {
        originalName: 'Californication',
        name: 'Californication',
        firstAirDate: '2007-08-13',
      },
    ])
  })

  it('parses name, season and episode', async () => {
    const result = await parseTitle('South.Park.S23.1080p.HDTV.x264-CRAVERS ~ 32.2 GB')

    expect(result).to.containSubset({
      type: 'series',
      title: 'South Park',
      year: '1997-08-13',
      season: 23,
    })
    expect(result.episode).to.be.null
  })

  it('parses name, season and episode', async () => {
    const result = await parseTitle('South.Park.S22E10.1080p.HDTV.x264-CRAVERS ~ 717.4 MB')

    expect(result).to.containSubset({
      type: 'series',
      title: 'South Park',
      year: '1997-08-13',
      episode: {
        airDate: '2018-12-12',
        number: 10,
      },
      season: 22,
    })
  })
})
