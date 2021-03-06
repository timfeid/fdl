import {findExtractor, Extractor} from '@fdl/extraction'
import { DownloadInfo, DownloadBundle, Step } from '@fdl/types'
import Koa from 'koa'
import {Manager, Download} from '@fdl/downloader'
import { getOption } from '@fdl/config'
import fs from 'fs'
import {logger} from '@fdl/logger'

const manager = new Manager(8)

function convertToObject (info: DownloadInfo, downloads: Download[], extractor?: Extractor): DownloadBundle {
  return {
    ...info,
    downloads: downloads.map(d => d.toObject()),
    extraction: {
      progress: extractor ? extractor.progress : 0,
      ...(extractor && extractor.complete ? {files: extractor.finalItems()} : {}),
      started: extractor ? true : false,
    },
    step: extractor ? (extractor.complete ? Step.COMPLETE : Step.EXTRACT) : (downloads.find(d => d.started) ? Step.DOWNLOAD : Step.QUEUE),
    downloadProgress: Math.round(
      (100 * downloads.reduce((val, d) => val + d.downloaded, 0)) /
        downloads.reduce((val, d) => val + (d.contentLength || 0), 0)
    ),
  }
}

function getProgress(bundle: DownloadBundle) {
  if (bundle.step === 'download') {
    return `d${bundle.downloadProgress}`
  }

  if (bundle.step === 'extract' && bundle.extraction) {
    return `e${bundle.extraction.progress}`
  }

  return bundle.step
}

function deleteFiles (downloads: Download[], app: Koa) {
  for (const download of downloads) {
    try {
      fs.unlinkSync(download.filepath)
    } catch (e) {
      app.emit('error', e)
      logger.debug(download)
    }
  }
}

export default async function downloadListener(app: Koa, info: DownloadInfo) {
  const downloads = info.urls.map(url => manager.add(url.url))
  let report = ''

  app.emit('download-queued', convertToObject(info, downloads))

  for (const download of downloads) {
    console.log(download.originalUrl)
    download.on('error', (err) => {
      app.emit('error', err)
    })
    download.on('progress', () => {
      const bundle = convertToObject(info, downloads)
      const newReport = getProgress(bundle)
      if (report !== newReport) {

        app.emit('update-progress', bundle)
        report = newReport
      }
    })
  }

  manager.startNextDownload()

  await Promise.all(downloads.map(async (download) => {
    return new Promise(resolve => {
      download.on('complete', () => {
        console.log('complete', download.filepath)
        app.emit('update-progress', convertToObject(info, downloads))
        resolve(download)
      })
    })
  }))

  const extractor = findExtractor(info, downloads)
  extractor.on('progress', () => app.emit('update-progress', convertToObject(info, downloads, extractor)))
  extractor.on('complete', () => app.emit('update-progress', convertToObject(info, downloads, extractor)))
  await extractor.extract(downloads)

  setTimeout(() => app.emit('update-progress', convertToObject(info, downloads, extractor)), 500)

  if (await getOption('deleteAfterDownload') && extractor.deleteAfterDownload) {
    deleteFiles(downloads, app)
  }

  app.emit('download-complete', extractor)
}

export const event = 'start-download'
