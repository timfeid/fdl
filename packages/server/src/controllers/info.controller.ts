import { Context } from 'koa'
import joi from 'joi'
import { app } from '../app'
import { Download, Type, Url } from '@fdl/data'
import { InfoService } from '@fdl/info'
import { hdencode } from '@fdl/link-grabber'

class InfoController {
  public async tvShows (ctx: Context) {
    const validation = joi.object({
      query: joi.string().required(),
    })
    const {error, value} = validation.validate(ctx.request.query)
    ctx.assert(!error, 400, JSON.stringify({error}))
    ctx.body = await InfoService.parseTitle(value.query)
  }

  public async imdb (ctx: Context) {
    const response = await InfoService.getByImdb(ctx.params.id)
    if (response.type.name === 'series' && ctx.query.name) {
      const info = await InfoService.parseTitle(ctx.query.name, response.title)
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

    ctx.body = await InfoService.search(value.query, value.type)
  }

  public async rawSeries (ctx: Context) {
    ctx.body = await InfoService.getRawSeries(parseInt(ctx.params.seriesId, 10))
  }

  public async series (ctx: Context) {
    ctx.body = await InfoService.getSeries(parseInt(ctx.params.seriesId, 10))
  }

  public async season (ctx: Context) {
    ctx.body = await InfoService.getSeries(parseInt(ctx.params.seriesId, 10), parseInt(ctx.params.season, 10))
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
        const imdb = await InfoService.getByImdb(info.imdb)

        if (imdb.type.name === 'series' && ctx.query.name) {
          const info = await InfoService.parseTitle(ctx.query.name, imdb.title)
          imdb.episode = info.episode
          imdb.season = info.season
        }

        info = {
          ...info,
          ...imdb,
          type: imdb.type.name,
        }
      } else {
        const tv = await InfoService.parseTitle(info.name)
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
