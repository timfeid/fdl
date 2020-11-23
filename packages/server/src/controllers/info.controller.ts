import { Context } from 'koa'
import joi from 'joi'
import { app } from '../app'
import { Download, Type, Url } from '@fdl/data'
import { TVService, ImdbService } from '@fdl/info'
import { hdencode } from '@fdl/link-grabber'

class InfoController {
  public async tvShows (ctx: Context) {
    const validation = joi.object({
      query: joi.string().required(),
    })
    const {error, value} = validation.validate(ctx.request.query)
    ctx.assert(!error, 400, JSON.stringify({error}))
    ctx.body = await TVService.parseTitle(value.query)
  }

  public async imdb (ctx: Context) {
    const response = await ImdbService.getInfo(ctx.params.id)
    if (response.type.name === 'series' && ctx.query.name) {
      const info = await TVService.parseTitle(ctx.query.name, response.title)
      response.episode = info.episode
      response.season = info.season
    }
    ctx.body = response
  }

  public async search (ctx: Context) {
    const validation = joi.object({
      query: joi.string().required(),
      type: joi.string().optional().allow('', 'multi', 'series', 'movie').default('multi'),
    })
    const {error, value} = validation.validate(ctx.request.query)
    ctx.assert(!error, 400, JSON.stringify({error}))

    ctx.body = await TVService.search(value.query, value.type)
  }

  public async series (ctx: Context) {
    ctx.body = await TVService.getMovieDbSeries(parseInt(ctx.params.seriesId, 10))
  }

  public async season (ctx: Context) {
    ctx.body = await TVService.getMovieDbSeries(parseInt(ctx.params.seriesId, 10), parseInt(ctx.params.season, 10))
  }

  public async fromLink (ctx: Context) {
    const validation = joi.object({
      url: joi.string(),
    })

    const {error, value} = validation.validate(ctx.request.query)
    ctx.assert(!error, 400, JSON.stringify({error}))

    if (/hdencode\.com/.test(value.url)) {
      let info = await hdencode(value.url) as any

      if (info.imdb) {
        const imdb = await ImdbService.getInfo(info.imdb)

        if (imdb.type.name === 'series' && ctx.query.name) {
          const info = await TVService.parseTitle(ctx.query.name, imdb.title)
          imdb.episode = info.episode
          imdb.season = info.season
        }

        info = {
          ...info,
          ...imdb,
          type: imdb.type.name,
        }
      } else {
        const tv = await TVService.parseTitle(info.name)
        info = {
          ...info,
          ...tv,
          type: tv.type.name,
        }
      }

      ctx.body = info
      return
    }

    ctx.abort(400, 'URL not supported')
  }
}

export default new InfoController
