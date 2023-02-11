import { MediaType, PrismaClient } from '@fdl/data'
import Parser from 'rss-parser'
import Container, { Inject } from 'typedi'
import { hdencode } from '../../hdencode/hdencode'
import { Extractor, ExtractorTest } from '../extractor'
import { DownloadableService } from '@fdl/server'
import { TmdbService } from '@fdl/server/src/modules/tmdb/tmdb.service'
import { MediaService } from '@fdl/server/src/modules/media/media.service'
import { CreateDownloadableArgs } from '@fdl/server/src/modules/downloadable/downloadable.schema'

class HdeExtractor extends Extractor {
  private readonly prisma: PrismaClient
  private readonly downloadableService: DownloadableService
  private readonly mediaService: MediaService
  private readonly tmdbService: TmdbService
  constructor(data) {
    super(data)
    this.prisma = Container.get(PrismaClient)
    this.downloadableService = Container.get(DownloadableService)
    this.tmdbService = Container.get(TmdbService)
    this.mediaService = Container.get(MediaService)
  }

  async extractSync() {
    for (const item of this.data.items) {
      if (!(await this.extractItem(item))) {
        console.log('Unable to extract item', item)
      }
    }
  }

  async extractAsync() {
    const extractions: Promise<any>[] = []

    for (const item of this.data.items) {
      extractions.push(this.extractItem(item))
    }

    await Promise.all(extractions)
  }

  async extract() {
    // async is too stressful for now
    await this.extractSync()

    console.log('all done!')
  }

  extractSeasonAndEpisode(query: string) {
    let season: number
    let name = query.replace(/\./g, ' ').trim()
    let episode: number | undefined = undefined

    const match = name.match(/^(.*?)s?(\d+)\D(\d+)/i)
    if (match) {
      season = parseInt(match[2].trim(), 10)
      episode = match[3].trim() ? parseInt(match[3].trim(), 10) : undefined
      name = match[1].replace(/\./g, ' ').trim().replace(/\d{4}/g, '').trim()
    }

    return {
      season,
      name,
      episode,
    }
  }

  async parseTitle(query: string, name?: string) {
    const info = this.extractSeasonAndEpisode(query)
    const { season } = info
    let { episode } = info
    if (!name) {
      name = info.name
    }

    const shows = await this.tmdbService.search(name)

    if (shows.length > 0) {
      const year = shows[0].year
      const title = shows[0].title
      const poster = shows[0].poster
      const backdrop = shows[0].backdrop
      let blurb = shows[0].blurb

      if (episode) {
        const e = await this.tmdbService.getEpisode(shows[0].id, season, episode)
        if (e) {
          blurb = e.blurb
          episode = e.number
        } else {
          episode = undefined
        }
      }

      return {
        tmdbId: shows[0].tmdbId,
        title,
        year,
        episode,
        backdrop,
        season,
        blurb,
        poster,
      }
    }

    return null
  }

  async extractItem(item: { [key: string]: any } & Parser.Item) {
    if (await this.itemExists(item.guid)) {
      return true
    }

    const info = await hdencode(item.link)
    const { season, episode } = this.extractSeasonAndEpisode(info.name)
    const downloadable: CreateDownloadableArgs = {
      title: info.name,
      season,
      episode,
      guid: item.guid,
      referrer: info.url,
      urls: info.urls,
      mediaId: null,
    }

    if (!info) {
      console.log('no info', item)
      return
    }
    if (info.imdb) {
      const media = await this.mediaService.findOrCreate({ imdbId: info.imdb })
      downloadable.mediaId = media?.id
    }

    if (!downloadable.mediaId) {
      const parsed = await this.parseTitle(info.name)
      if (parsed) {
        const media = await this.mediaService.findOrCreate({
          tmdbId: parsed.tmdbId,
          type: MediaType.SERIES,
        })
        downloadable.mediaId = media?.id
      }
    }

    if (downloadable.mediaId) {
      await this.downloadableService.addDownloadable(downloadable)

      console.log('item created')
      return true
    }

    return false
  }

  async itemExists(guid: string) {
    const downloadable = await this.prisma.downloadable.findUnique({
      where: {
        guid,
      },
    })

    return !!downloadable
  }
}

export const hdeExtractor: ExtractorTest = {
  class: HdeExtractor,
  test: url => url.includes('hdencode.org'),
}
