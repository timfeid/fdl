import { Downloadable, Media, MediaType } from '@prisma/client'
import { Service } from 'typedi'
import { ConfigService } from '../config/config.service'
import path from 'path'
import fs from 'fs'
import { dir } from 'console'

@Service()
export class DirectoryService {
  constructor(private readonly configService: ConfigService) {}

  ensureDirExists(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  getDownloadDirectory(downloadable: Downloadable) {
    const dir = path.join(this.configService.rootDownloadsDir, downloadable.id)
    this.ensureDirExists(dir)

    return dir
  }

  safeDirectory(dir: string) {
    return dir.replace(/[/\\?%*:|"<>]/g, '-')
  }

  getMovieDirectory(downloadable: Downloadable & { media: Media }) {
    const rawTitle = `${downloadable.media.title} (${downloadable.media.date.substring(0, 4)})`
    return path.join(this.configService.rootMoviesDir, this.safeDirectory(rawTitle))
  }

  getSeriesDirectory(downloadable: Downloadable & { media: Media }) {
    return path.join(
      this.configService.rootSeriesDir,
      this.safeDirectory(downloadable.media.title),
      `Season ${downloadable.season.toString().padStart(2, '0')}`,
    )
  }

  getDownloadableMediaDirectory(downloadable: Downloadable & { media: Media }) {
    const dir =
      downloadable.media.type === MediaType.MOVIE
        ? this.getMovieDirectory(downloadable)
        : this.getSeriesDirectory(downloadable)

    this.ensureDirExists(dir)

    return dir
  }
}
