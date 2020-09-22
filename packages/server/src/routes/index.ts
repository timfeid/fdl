import Router from 'koa-router'
import downloadController from '../controllers/download.controller'
import infoController from '../controllers/info.controller'

const router = new Router()

router.get('/', ctx => {
  ctx.body = 'hi'
})

router.post('/downloads', downloadController.download)
router.get('/downloads', downloadController.list)

router.get('/info/tv-shows', infoController.tvShows)
router.get('/info/imdb/:id', infoController.imdb)

export {router}
