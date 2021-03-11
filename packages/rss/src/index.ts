import { createConnection, Rss } from '@fdl/data'
import moment from 'moment'
import Parser from 'rss-parser'
import { createHencodeDownloadable } from './hdencode'

const parser = new Parser()

const feeds = [
  {
    name: 'HD Encode - TV shows',
    url: 'https://hdencode.org/tag/tv-shows/feed/',
  },
  {
    name: 'HD Encode - Movies',
    url: 'https://hdencode.org/tag/movies/feed/',
  },
]

export async function seed () {
  await createConnection()
  // console.log(await Downloadable.find())

  for (const feed of feeds) {
    const rss = await Rss.findOne({url: feed.url}) || await Rss.create({url: feed.url})
    rss.name = feed.name
    rss.lastGrabbedAt = rss.lastGrabbedAt || new Date()
    await rss.save()
  }

}

async function createDownloadable(item: any) {
  if (item.link.includes('hdencode.org')) {
    return await createHencodeDownloadable(item)
  }
}

export async function getNewRssData () {
  console.log(moment().toISOString(), 'getting rss data')
  const feeds = await Rss.find()
  for (const feed of feeds) {
    const parsed = await parser.parseURL(feed.url)
    for (const item of parsed.items) {
      await createDownloadable(item)
    }
  }
}

// seed().then(() => {

//   getNewRssData().then(() => {

//     console.log('done!')
//   })
// })
