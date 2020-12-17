import {app} from '../src/app'
import chai, { expect } from 'chai'
import request from 'supertest'
import ss from 'chai-subset'
import {createHencodeDownloadable} from '../../rss/src/hdencode'
import item from './item.json'
chai.use(ss)

describe('gets downloadables', () => {
  it('downloads a txt file to the correct location', async () => {
    const downloadable = await createHencodeDownloadable(item)
    const response = await request(app.callback()).get('/downloadables').send().type('json')
    expect(response.body).to.containSubset([{
      id: downloadable.id,
      referrer: downloadable.referrer,
    }])

  })

})
