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
    })
    expect(response.body.episode).to.be.undefined
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
      year: '2020',
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
        title: 'South Park',
        year: '1997–',
        type: {name: 'series'},
      },
    ])
  })

  it('can search movies', async () => {
    const query = 'King of California'
    const response = await request(app.callback()).get(`/info/search/?query=${query}`).type('json')
    expect(response.status).to.eq(200)
    expect(response.body).to.containSubset([
      {
        title: 'King of California',
        year: '2007',
        type: {name: 'movie'},
      },
    ])
  })

  it('can get a series', async () => {
    const query = '2190'
    const response = await request(app.callback()).get(`/info/series/${query}`).type('json')
    expect(response.status).to.eq(200)
    expect(response.body).to.containSubset({
      title: 'South Park',
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


  it('get movie info from an hdencode link', async () => {
    const url = encodeURIComponent('https://hdencode.com/the-crazies-2010-1080p-bluray-dd5-1-x264-dirty-8-8-gb/')

    const response = await request(app.callback()).get(`/info/from-link?url=${url}`).type('json')
    expect(response.status).to.eq(200)
    expect(response.body).to.containSubset({
      url: 'https://hdencode.com/the-crazies-2010-1080p-bluray-dd5-1-x264-dirty-8-8-gb/#unlocked',
      name: 'The.Crazies.2010.1080p.BluRay.DD5.1.x264-DiRTY – 8.8 GB',
      type: 'movie',
      urls: [
        'https://rapidgator.net/file/65c3840b1f2e585101e7f7c11fb52b51/TheCais210180BlRayDD5x6DiRY.part1.rar.html',
        'https://rapidgator.net/file/19480c5e197693a40ed0fee5e99c6f89/TheCais210180BlRayDD5x6DiRY.part2.rar.html',
        'https://rapidgator.net/file/cd0c045a9e113ef9fe7b91aedc5a9a98/TheCais210180BlRayDD5x6DiRY.part3.rar.html'
      ],
      imdb: 'tt0455407',
      title: 'The Crazies',
      year: '2010',
      blurb: 'Four friends find themselves trapped in their small hometown after they discover their friends and neighbors going quickly and horrifically insane.',
      poster: 'https://image.tmdb.org/t/p/original/fiJFGiqXUelHJ9Ms8mtFOCsFf4B.jpg'
    })
  })


  it('get episode info from an hdencode link', async () => {
    const url = encodeURIComponent('https://hdencode.com/young-sheldon-s04e03-training-wheels-and-an-unleashed-chicken-1080p-amzn-web-dl-ddp5-1-h-264-tommy-1-0-gb/')

    const response = await request(app.callback()).get(`/info/from-link?url=${url}`).type('json')
    expect(response.status).to.eq(200)
    expect(response.body).to.containSubset({
      url: 'https://hdencode.com/young-sheldon-s04e03-training-wheels-and-an-unleashed-chicken-1080p-amzn-web-dl-ddp5-1-h-264-tommy-1-0-gb/#unlocked',
      name: 'Young.Sheldon.S04E03.Training.Wheels.and.an.Unleashed.Chicken.1080p.AMZN.WEB-DL.DDP5.1.H.264-TOMMY – 1.0 GB',
      type: 'series',
      urls: [
        'https://rapidgator.net/file/a16b7edb3760a913a75f24684360f4fb/YugSednS0403TaninWelsandUlahdCikn18pAZWEDDP126TMY.rar.html'
      ],
      imdb: null,
      title: 'Young Sheldon',
      year: '2017–',
      episode: 3,
      season: 4,
      blurb: 'With college in sight, Sheldon is determined to ride his bike without training wheels. Also, Mary and George Sr. argue over parenting styles.',
      poster: 'https://image.tmdb.org/t/p/original/aESxB2HblKlDzma39xVefa20pbW.jpg'
    })
  })


  it('get tv pack info from an hdencode link', async () => {
    const url = encodeURIComponent('https://hdencode.com/voices-of-fire-s01-1080p-nf-web-dl-ddp5-1-h-264-ntb-11-1-gb/')

    const response = await request(app.callback()).get(`/info/from-link?url=${url}`).type('json')
    expect(response.status).to.eq(200)
    expect(response.body).to.containSubset({
      url: 'https://hdencode.com/voices-of-fire-s01-1080p-nf-web-dl-ddp5-1-h-264-ntb-11-1-gb/#unlocked',
      name: 'Voices.of.Fire.S01.1080p.NF.WEB-DL.DDP5.1.H.264-NTb – 11.1 GB',
      type: 'series',
      urls: [
        'https://rapidgator.net/file/f6ac75a56272154341296fe0caa6e4b7/VoieofFrS1100WBLDP124Nb.part1.rar.html',
        'https://rapidgator.net/file/489238eafccd7a8b062f97695463b450/VoieofFrS1100WBLDP124Nb.part2.rar.html',
        'https://rapidgator.net/file/f75522c4832e4de30cbf9969cbcae4fe/VoieofFrS1100WBLDP124Nb.part3.rar.html'
      ],
      imdb: null,
      title: 'Voices of Fire',
      year: '2020–',
      episode: undefined,
      season: 1,
      blurb: 'Pharrell Williams\'s hometown community leaders attempt to build one of the world\'s most inspiring gospel choirs.',
      poster: 'https://image.tmdb.org/t/p/original/NiwMyjt3ItX0VsP0S5YjPKhh0p.jpg'
    })
  })
})
