import { Context } from 'koa'
import joi from 'joi'
import { app } from '../app'
import { Download, Type, Url } from '@fdl/data'
import { TVService, ImdbService } from '@fdl/info'

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
      type: joi.string().allow('series').allow('movie').required(),
    })
    const {error, value} = validation.validate(ctx.request.query)
    ctx.assert(!error, 400, JSON.stringify({error}))

    if (value.type === 'series') {
      ctx.body = await TVService.search(value.query)
    } else {
      ctx.body = await TVService.search(value.query, 'movie')
    }
  }

  public async series (ctx: Context) {
    ctx.body = await TVService.getMovieDbSeries(parseInt(ctx.params.seriesId, 10))
  }

  public async season (ctx: Context) {
    ctx.body = await TVService.getMovieDbSeries(parseInt(ctx.params.seriesId, 10), parseInt(ctx.params.season, 10))
  }
}

export default new InfoController
