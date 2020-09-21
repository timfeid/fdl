import { Context } from 'koa'
import joi from 'joi'
import { app } from '../app'
import { Download, Type, Url } from '@fdl/data'
import { Step } from '@fdl/types'

class DownloadController {
  public async list (ctx: Context) {
    ctx.body = await Download.find({order: {createdAt: 'DESC'}})
  }

  public async download (ctx: Context) {
    const validation = joi.object({
      urls: joi.array().items(joi.string()).min(1).required(),
      type: joi.string().allow('series').allow('movie').required(),
      title: joi.string().required(),
      year: joi.string().required(),
      blurb: joi.string().required(),
      poster: joi.string().required(),
      referrer: joi.string(),
      ...(ctx.request.body.type === 'series' ? {
        season: joi.number().required(),
        episode: joi.number(),
      } : {})
    }).unknown()
    const {error, value} = validation.validate(ctx.request.body)
    ctx.assert(!error, 400, JSON.stringify({error}))

    const download = new Download()
    download.poster = value.poster
    download.blurb = value.blurb
    download.title = value.title
    download.referrer = value.referrer
    download.year = value.year
    download.urls = await Promise.all(value.urls.map(async (url: string) => await Url.create({url}).save()))
    download.type = await Type.findOne({name: value.type}) || await Type.create({name: value.type}).save()
    download.episode = value.episode
    download.season = value.season
    await download.save()

    app.emit('start-download', download)

    ctx.body = {
      download,
    }
  }
}

export default new DownloadController
