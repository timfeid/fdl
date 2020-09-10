import Router from 'koa-router'
import downloadController from '../controllers/download-controller'

const router = new Router()

router.get('/', ctx => {
  ctx.body = 'hi'
})

router.post('/download', downloadController.download)

export {router}
