import http from 'http'
import {InfoResponse} from '@fdl/info'
import { app } from './app'
import {logger} from '@fdl/logger'
import {DownloadObject} from '@fdl/downloader'
import {createSocketIo} from './socket'

export interface DownloadInfo extends InfoResponse {
  urls: string[],
}

export interface Extraction {
  progress: number
  files?: string[]
  started: boolean
}

export interface DownloadBundle extends DownloadInfo {
  id: string,
  downloads: DownloadObject[]
  extraction: Extraction
  step: 'download' | 'extract' | 'queue' | 'complete'
}

const server = http.createServer(app.callback())
createSocketIo(server, app)
server.listen(4242, '0.0.0.0', 0, () => {
  logger.verbose(`listening on port ${4242}`)
})
