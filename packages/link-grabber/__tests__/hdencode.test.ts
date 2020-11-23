import chai, { expect } from 'chai'
import ss from 'chai-subset'
import { hdencode } from '../src/hdencode'
chai.use(ss)

describe('receives download links', () => {
  it('Cinderella story', async () => {
    const response = await hdencode('https://hdencode.com/a-cinderella-story-2004-720p-bluray-x264-nortv-4-4-gb/')

    expect(response).to.have.property('imdb').eq('tt0356470')
    expect(response).to.have.property('type').eq('movie')
    expect(response).to.have.property('name').eq('A.Cinderella.Story.2004.720p.BluRay.x264-NorTV – 4.4 GB')
    expect(response).to.have.property('urls').containSubset([
      'https://rapidgator.net/file/d62734bd1274fa33c8980f375938eeec/CneelStoy2072pBuRyx6oTV.part1.rar.html',
      'https://rapidgator.net/file/d9d4ba552f5e88591f52d9941dfdb81c/CneelStoy2072pBuRyx6oTV.part2.rar.html',
    ])
  })

})
