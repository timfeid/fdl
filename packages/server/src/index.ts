import http from 'http'
import { app } from './app'
import {logger} from '@fdl/logger'
import {createSocketIo} from './socket'
import {CronJob} from 'cron'
import {getNewRssData, seed} from '@fdl/rss'

const server = http.createServer(app.callback())
createSocketIo(server, app)
app.on('ready', () => {
  server.listen(4242, '0.0.0.0', 0, () => {
    logger.verbose(`listening on port ${4242}`)
  })
  seed()
  getNewRssData()
  const cron = new CronJob('* 6 * * * *', getNewRssData)
  cron.start()
})
