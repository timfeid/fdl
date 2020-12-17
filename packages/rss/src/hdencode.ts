import { Entity, Downloadable, Type, Url } from '@fdl/data'
import {hdencode} from '@fdl/link-grabber'
import {InfoService} from '@fdl/info'
import { Tag } from '../../data/src/entities/tag.entity'

type HDEncodeItem =   {
  creator: string,
  title: string,
  link: string,
  pubDate: string,
  'dc:creator': string,
  comments: string,
  content: string,
  contentSnippet: string,
  guid: string,
  categories: string[],
  isoDate: string,
}

const validQualities: {[index: string]: RegExp[]} = {
  '2160p': [
    /2160p?/,
  ],
  '1080p': [
    /1080p?/,
  ],
  '720p': [
    /720p?/,
  ],
  HDTV: [
    /hdtv/i,
  ],
}
function extractQuality(title: string) {
  let reg: RegExp
  for (const quality in validQualities) {
    for (reg of validQualities[quality]) {

      if (title.match(reg)) {
        return quality
      }
    }
  }
}

export async function createHencodeDownloadable(item: HDEncodeItem): Promise<Downloadable> {
  const downloadable = await Downloadable.findOne({guid: item.guid}) || Downloadable.create({guid: item.guid})

  if (downloadable.id) {
    return downloadable
  }

  downloadable.referrer = item.link
  downloadable.quality = extractQuality(item.title)

  const linkInfo = await hdencode(item.link)
  // console.log(linkInfo)
  if (linkInfo.urls.length === 0 || !linkInfo.urls[0].includes('rapidgator.net')) {
    console.log('skipping content, no valid URLs', item.link, linkInfo)
    return
  }

  // if (linkInfo.imdb) {
  const info = linkInfo.imdb ? await InfoService.getByImdb(linkInfo.imdb, linkInfo.name) : await InfoService.parseTitle(linkInfo.name)
  // console.log(info)
  const guid = `${info.type.name}-${info.id}-${info.season || ''}E${info.episode || ''}`
  downloadable.urls = await Promise.all(linkInfo.urls.map(async (url: string) => await Url.create({url}).save()))
  downloadable.entity = await Entity.findOne({guid}) || Entity.create({guid})
  const newTags = [...(downloadable.entity.tags || []), ...await Promise.all(linkInfo.categories.map(async (text: string) => await Tag.findOne({text}) || await Tag.create({text}).save()))]
  const finalTags: Tag[] = []
  newTags.forEach(item => {
    if (!finalTags.find(x => x.id == item.id)) {
      finalTags.push(item)
    }
  })
  downloadable.entity.tags = finalTags
  downloadable.entity.title = info.title
  downloadable.entity.trailer = info.trailer
  downloadable.entity.blurb = info.blurb
  downloadable.entity.episode = info.episode
  downloadable.entity.poster = info.poster
  downloadable.entity.backdrop = info.backdrop
  downloadable.entity.season = info.season
  downloadable.entity.type = await Type.findOne({name: info.type.name}) || await Type.create({name: info.type.name}).save()
  downloadable.entity.year = info.year
  if (info.rating) {
    downloadable.entity.ratingAverage = info.rating.average
    downloadable.entity.ratingVotes = info.rating.votes
  }
  // } else {
  //   // time for some guess work
  //   const info = await InfoService.parseTitle(linkInfo.name)
  // }

  // console.log(downloadable, downloadable.entity)
  await downloadable.entity.save()
  await downloadable.save()

  console.log('created downloadable:', downloadable)

  return downloadable
}
