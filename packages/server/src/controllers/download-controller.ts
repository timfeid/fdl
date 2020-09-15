import { Context } from 'koa'
import joi from 'joi'
import { app } from '../app'

class DownloadController {
  public async download (ctx: Context) {
    const validation = joi.object({
      urls: joi.array().items(joi.string()).min(1).required(),
      type: joi.string().allow('series').allow('movie').required(),
      title: joi.string().required(),
      blurb: joi.string().required(),
      poster: joi.string().required(),
      ...(ctx.request.body.type === 'series' ? {
        season: joi.number().required(),
        episode: joi.number(),
      } : {})
    }).unknown()
    const {error, value} = validation.validate(ctx.request.body)
    ctx.assert(!error, 400, JSON.stringify({error}))

    app.emit('start-download', value)

    ctx.body = {
      started: true,
    }
  }
}

export default new DownloadController
