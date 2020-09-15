import {findExtractor, Extractor} from '@fdl/extraction'
import { DownloadInfo, DownloadBundle } from '..'
import Koa from 'koa'
import {Manager, Download} from '@fdl/downloader'
import md5 from 'md5'

const manager = new Manager(8)

function convertToObject (info: DownloadInfo, downloads: Download[], extractor?: Extractor): DownloadBundle {
  return {
    id: md5(info.urls.join(',')),
    ...info,
    downloads: downloads.map(d => d.toObject()),
    extraction: {
      progress: extractor ? extractor.progress : 0,
      ...(extractor && extractor.complete ? {files: extractor.finalItems()} : {}),
      started: extractor ? true : false,
    },
    step: extractor ? (extractor.complete ? 'complete' : 'extract') : (downloads.find(d => d.started) ? 'download' : 'queue'),
  }
}

export default async function downloadListener(app: Koa, info: DownloadInfo) {
  const downloads = info.urls.map(url => manager.add(url))

  app.emit('download-queued', convertToObject(info, downloads))

  for (const download of downloads) {
    download.on('progress', () => {
      app.emit('download-progress', convertToObject(info, downloads))
    })
  }

  manager.startNextDownload()

  await Promise.all(downloads.map(async (download) => {
    return new Promise(resolve => {
      download.on('complete', () => resolve(download))
    })
  }))

  const extractor = findExtractor(info, downloads)
  extractor.on('progress', () => app.emit('download-progress', convertToObject(info, downloads, extractor)))
  extractor.on('complete', () => app.emit('download-progress', convertToObject(info, downloads, extractor)))
  await extractor.extract(downloads)


  app.emit('download-complete', extractor)
}

export const event = 'start-download'
