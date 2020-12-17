import { Context } from 'koa'
import joi from 'joi'
import { app } from '../app'
import { Download, Downloadable, Entity, Type, Url } from '@fdl/data'

const PER_PAGE = 15

class DownloadablesController {
  public async list (ctx: Context) {
    const query = Entity.createQueryBuilder('entities')
    const page = ctx.request.query.page
    let tagIds = ctx.request.query['tagIds[]']
    tagIds = typeof tagIds === 'string' ? [tagIds] : tagIds

    query.innerJoinAndSelect('entities.downloadables', 'downloadables')
    query.innerJoinAndSelect('entities.type', 'type')
    query.innerJoinAndSelect('entities.tags', 'tags')
    query.innerJoinAndSelect('downloadables.urls', 'urls')

    if (tagIds) {
      query.where('tags.id in (:...tagIds)', {tagIds: tagIds})
    }

    query.orderBy('entities.createdAt', 'DESC')

    if (page) {
      query.skip(parseInt(page, 10) * PER_PAGE)
      query.take(PER_PAGE)
    }

    ctx.body = await query.getMany()
  }

}

export default new DownloadablesController
