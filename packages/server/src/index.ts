import {InfoResponse} from '@fdl/info'
import { app } from './app'
import {logger} from '@fdl/logger'
import {DownloadObject} from '@fdl/downloader'

export interface DownloadInfo extends InfoResponse {
  urls: string[],
}

export interface Extraction {
  progress: number
  files?: string[]
  started: boolean
}

export interface DownloadBundle extends DownloadInfo {
  downloads: DownloadObject[]
  extraction: Extraction
  step: 'download' | 'extract' | 'queued' | 'complete'
}

app.listen(4242, '0.0.0.0', 0, () => {
  logger.verbose(`listening on port ${4242}`)
})
