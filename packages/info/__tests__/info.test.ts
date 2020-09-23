import chai, { expect } from 'chai'
import { getInfo } from '../src/imdb'
import { search, parseTitle } from '../src/tv'
import chaiSubset from 'chai-subset'

chai.use(chaiSubset)

describe('gets information about movies/shows', () => {
  it('tv from imdb', async () => {
    const info = await getInfo('tt1986770')

    expect(info).to.not.be.null
    expect(info).to.have.property('type').to.have.property('name').to.eq('series')
    expect(info).to.have.property('year').to.eq('2012–2014')
    expect(info).to.have.property('title').to.eq('Anger Management')
    expect(info).to.have.property('blurb').to.be.a('string')
    expect(info).to.have.property('poster').to.be.a('string')
  })

  it('movie from imdb', async () => {
    const info = await getInfo('tt0077651')

    expect(info).to.not.be.null
    expect(info).to.have.property('type').to.have.property('name').to.eq('movie')
    expect(info).to.have.property('year').to.eq('1978')
    expect(info).to.have.property('title').to.eq('Halloween')
    expect(info).to.have.property('blurb').to.be.a('string')
    expect(info).to.have.property('poster').to.be.a('string')
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
    expect(results[0]).to.have.property('blurb').be.a('string')
  })

  it('multisearch the moviedb', async () => {
    const results = await search('Californ', 'multi')

    expect(results).to.containSubset([
      {
        name: 'Californication',
        firstAirDate: '2007-08-13',
        type: 'series',
      },
      {
        name: 'King of California',
        firstAirDate: '2007',
        type: 'movie',
      },
    ])
    expect(results[0]).to.have.property('blurb').be.a('string')
  })

  it('parses name, season', async () => {
    const result = await parseTitle('South.Park.S23.1080p.HDTV.x264-CRAVERS ~ 32.2 GB')

    expect(result).to.containSubset({
      type: {name: 'series'},
      title: 'South Park',
      year: '1997-08-13',
      season: 23,
    })
    expect(result.episode).to.be.null
    expect(result).to.have.property('blurb').be.a('string')
    expect(result).to.have.property('poster').be.a('string')
  })

  it('parses name, season and episode', async () => {
    const result = await parseTitle('South.Park.S22E10.1080p.HDTV.x264-CRAVERS ~ 717.4 MB')

    expect(result).to.containSubset({
      type: {name: 'series'},
      title: 'South Park',
      year: '1997-08-13',
      episode: 10,
      season: 22,
    })
    expect(result).to.have.property('blurb').be.a('string')
    expect(result).to.have.property('poster').be.a('string')
  })
})
