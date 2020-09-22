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

    const emptyContentLengths = download.urls.filter(url => !url.contentLength)
    if (emptyContentLengths.length > 0) {
      Promise.all(emptyContentLengths.map(async url => {
        url.contentLength = info.downloads.find(dl => dl.originalUrl === url.url).contentLength
        return url.save()
      }))
    }
    download.step = info.step
    download.save()

    app.emit('download-progress', {
      ...info,
      ...download,
    })
  }
}

export const event = 'update-progress'
