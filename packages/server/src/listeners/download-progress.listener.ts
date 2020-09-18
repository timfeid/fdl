import { DownloadBundle } from '@fdl/info'
import Koa from 'koa'
import {Download} from '@fdl/data'


export default async function downloadProgress(app: Koa, info: DownloadBundle) {
  const download = await Download.findOne(info.id)
  if (download) {
    download.step = info.step
    download.save()
  }
}

export const event = 'download-progress'
