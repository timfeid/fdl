import { DownloadBundle, Step } from '@fdl/types'
import Koa from 'koa'
import {Download} from '@fdl/data'


export default async function downloadProgress(app: Koa, info: DownloadBundle) {
  const download = await Download.findOne(info.id)
  if (download) {
    if (download.startedAt === null && info.step === Step.DOWNLOAD) {
      download.startedAt = new Date()
    }
    if (download.completedAt === null && info.step === Step.COMPLETE) {
      download.completedAt = new Date()
    }
    download.step = info.step
    download.save()
  }
}

export const event = 'download-progress'
