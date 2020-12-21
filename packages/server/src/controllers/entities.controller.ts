import { Context } from 'koa'
import joi from 'joi'
import { app } from '../app'
import { Download, Downloadable, Entity, Type, Url } from '@fdl/data'

const PER_PAGE = 15

class DownloadablesController {
  public async list (ctx: Context) {
    const query = Entity.createQueryBuilder('entities')
    const page = ctx.request.query.page
    const search = ctx.request.query.search
    let tagIds = ctx.request.query['tagIds[]']
    let yearTagIds = ctx.request.query['yearTagIds[]']
    let qualityTagIds = ctx.request.query['qualityTagIds[]']
    tagIds = typeof tagIds === 'string' ? [tagIds] : tagIds
    yearTagIds = typeof yearTagIds === 'string' ? [yearTagIds] : yearTagIds
    qualityTagIds = typeof qualityTagIds === 'string' ? [qualityTagIds] : qualityTagIds

    query.innerJoinAndSelect('entities.downloadables', 'downloadables')
    query.innerJoinAndSelect('entities.type', 'type')
    query.innerJoinAndSelect('entities.tags', 'tags')

    query.innerJoinAndSelect('downloadables.urls', 'urls')
    query.where('entities.id is not null')

    if (tagIds) {
      query.innerJoin('entities.tags', 'filteredTags')
      query.andWhere('filteredTags.id in (:...tagIds)', {tagIds: tagIds})
    }

    if (yearTagIds) {
      query.innerJoin('entities.tags', 'filteredYearTags')
      query.andWhere('filteredYearTags.id in (:...yearTagIds)', {yearTagIds: yearTagIds})
    }

    if (qualityTagIds) {
      query.innerJoin('entities.tags', 'filteredQualityTags')
      query.andWhere('filteredQualityTags.id in (:...qualityTagIds)', {qualityTagIds: qualityTagIds})
    }

    if (search) {
      query.andWhere('entities.title like :search', {search: `%${search}%`})
    }

    query.orderBy('entities.createdAt', 'DESC')

    if (page) {
      query.skip((parseInt(page, 10) - 1) * PER_PAGE)
      query.take(PER_PAGE)
    }

    ctx.body = await query.getMany()
  }

}

export default new DownloadablesController
