import chai, { expect } from 'chai'
import { search, parseTitle, getByImdb } from '../src/themoviedb'
import chaiSubset from 'chai-subset'

chai.use(chaiSubset)

describe('gets information about movies/shows', () => {
  it('tv from imdb', async () => {
    const info = await getByImdb('tt1986770')

    expect(info).to.not.be.null
    expect(info).to.have.property('type').to.have.property('name').to.eq('series')
    expect(info).to.have.property('year').to.eq('2012–2014')
    expect(info).to.have.property('title').to.eq('Anger Management')
    expect(info).to.have.property('blurb').to.be.a('string')
    expect(info).to.have.property('poster').to.be.a('string')
  })

  it('movie from imdb', async () => {
    const info = await getByImdb('tt0077651')

    expect(info).to.not.be.null
    expect(info).to.have.property('type').to.have.property('name').to.eq('movie')
    expect(info).to.have.property('year').to.eq('1978')
    expect(info).to.have.property('title').to.eq('Halloween')
    expect(info).to.have.property('blurb').to.be.a('string')
    expect(info).to.have.property('poster').to.be.a('string')
    expect(info).to.have.property('trailer').to.eq('https://youtu.be/zlgJC-q92t4')
  })

  it('search the moviedb', async () => {
    const results = await search('Californication')

    expect(results).to.containSubset([
      {
        title: 'Californication',
        year: '2007–2014',
      },
    ])
    expect(results[0]).to.have.property('blurb').be.a('string')
  })

  it('multisearch the moviedb', async () => {
    const results = await search('Californ', 'multi')

    expect(results).to.containSubset([
      {
        title: 'Californication',
        year: '2007–2014',
        type: {name: 'series'},
      },
      {
        title: 'King of California',
        year: '2007',
        type: {name: 'movie'},
      },
    ])
    expect(results[0]).to.have.property('blurb').be.a('string')
  })

  it('parses name, season', async () => {
    const result = await parseTitle('South.Park.S23.1080p.HDTV.x264-CRAVERS ~ 32.2 GB')

    expect(result).to.containSubset({
      type: {name: 'series'},
      title: 'South Park',
      year: '1997–2020',
      season: 23,
    })
    expect(result.episode).to.be.undefined
    expect(result).to.have.property('blurb').be.a('string')
    expect(result).to.have.property('poster').be.a('string')
  })

  it('parses name, season and episode', async () => {
    const result = await parseTitle('South.Park.S22E10.1080p.HDTV.x264-CRAVERS ~ 717.4 MB')

    expect(result).to.containSubset({
      type: {name: 'series'},
      title: 'South Park',
      year: '1997–2020',
      episode: 10,
      season: 22,
    })
    expect(result).to.have.property('blurb').be.a('string')
    expect(result).to.have.property('poster').be.a('string')
  })

  it('parses name, season and episode, part 2', async () => {
    const result = await parseTitle('Saved.By.The.Bell.2020.S01.2160p.STAN.WEB-DL.AAC5.1.H.265-NTb – 27.2 GB')

    expect(result).to.containSubset({
      type: {name: 'series'},
      title: 'Saved by the Bell',
      year: '1989–1993',
      season: 1,
    })
    expect(result).to.have.property('blurb').be.a('string')
    expect(result).to.have.property('poster').be.a('string')
  })
})
