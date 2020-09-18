import { Context } from 'koa'
import joi from 'joi'
import { app } from '../app'
import { Download, Type, Url } from '@fdl/data'
import { TVService, MovieService, Step } from '../../../info/src'

class InfoController {
  public async tvShows (ctx: Context) {
    const validation = joi.object({
      query: joi.string().required(),
    })
    const {error, value} = validation.validate(ctx.request.query)
    ctx.assert(!error, 400, JSON.stringify({error}))
    ctx.body = await TVService.parseTitle(value.query)
  }
  public async movies (ctx: Context) {
    const validation = joi.object({
      imdb: joi.string().required(),
    })
    const {error, value} = validation.validate(ctx.request.query)
    ctx.assert(!error, 400, JSON.stringify({error}))
    ctx.body = await MovieService.getInfo(value.imdb)
  }
}

export default new InfoController
