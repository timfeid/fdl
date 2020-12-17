import { Context } from 'koa'
import { Tag } from '@fdl/data'

class TagController {
  public async list (ctx: Context) {
    ctx.body = (await Tag.find({order: {text: 'ASC'}})).map(tag => {
      return {
        ...tag,
        category: tag.category,
      }
    })
  }

}

export default new TagController
