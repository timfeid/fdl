import Router from 'koa-router'
import downloadController from '../controllers/download.controller'
import entitiesController from '../controllers/entities.controller'
import infoController from '../controllers/info.controller'
import tagController from '../controllers/tags.controller'

const router = new Router()

router.get('/', ctx => {
  ctx.body = 'hi'
})

router.post('/downloads', downloadController.download)
router.get('/downloads', downloadController.list)

router.get('/tags', tagController.list)

router.get('/entities', entitiesController.list)

router.get('/info/from-link', infoController.fromLink)
router.get('/info/tv-shows', infoController.tvShows)
router.get('/info/imdb/:id', infoController.imdb)
router.get('/info/search', infoController.search)
router.get('/info/series/:seriesId/raw', infoController.rawSeries)
router.get('/info/series/:seriesId/:season', infoController.season)
router.get('/info/series/:seriesId', infoController.series)

export {router}
