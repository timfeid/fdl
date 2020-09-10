import {DownloadInfo} from '@fdl/server'
import {config} from '@fdl/config'
import path from 'path'

function seriesPath (downloadInfo: DownloadInfo) {
  const showPath = path.join(config.contentPath, 'TV Shows', downloadInfo.title)
  if (downloadInfo.season) {
    return path.join(showPath, `Season ${downloadInfo.season.toString().padStart(2, '0')}`)
  }

  return showPath
}

export default function finalpath (downloadInfo: DownloadInfo): string {
  switch (downloadInfo.type) {
  case 'movie':
    return path.join(config.contentPath, 'Movies', `${downloadInfo.title} (${downloadInfo.year})`)
  case 'series':
    return seriesPath(downloadInfo)
  }

  return ''
}
