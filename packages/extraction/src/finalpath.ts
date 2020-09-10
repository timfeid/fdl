import {DownloadInfo} from '@fdl/server'
import {config} from '@fdl/config'
import path from 'path'

export default function finalpath (downloadInfo: DownloadInfo) {
  switch (downloadInfo.type) {
    case 'movie':
      return path.join(config.contentPath, 'Movies', `${downloadInfo.title} (${downloadInfo.year})`)
    case 'series':
      const showPath = path.join(config.contentPath, 'TV Shows', downloadInfo.title)
      if (downloadInfo.season) {
        return path.join(showPath, `Season ${downloadInfo.season.toString().padStart(2, '0')}`)
      }

      return showPath
  }
}
