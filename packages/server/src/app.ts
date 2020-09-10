import Koa from 'koa'
import { loggerMiddleware } from './middleware/logger'
import {router} from './routes'
import bodyparser from 'koa-bodyparser'
import Download from '@fdl/downloader'
import { DownloadInfo } from '.'
import { findExtractor } from '../../extraction/src'



const app = new Koa()

app.use(bodyparser())
app.use(loggerMiddleware())
app.use(router.routes())

app.on('start-download', async (download: DownloadInfo) => {
  const downloads = await Promise.all(download.urls.map(async url => {
    const dl = new Download(url)
    await dl.start()

    return dl
  }))
  const extractor = findExtractor(download, downloads)

  await extractor.extract(downloads)

  app.emit('download-complete', extractor)
})

export {app}

