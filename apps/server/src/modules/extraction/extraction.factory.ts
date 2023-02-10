import { Downloadable, DownloadableUrl, Media } from '@prisma/client'
import { ConfigService } from '../config/config.service'
import { ExtractorTest } from './extractor'
import { rarExtractor } from './extractors/rar.extractor'
import fs from 'fs'
import path from 'path'

const extractors: ExtractorTest[] = [rarExtractor]

export class ExtractorFactory {
  static getExtractor(
    configService: ConfigService,
    startingDirectory: string,
    download: Downloadable & { media: Media; urls: DownloadableUrl[] },
  ) {
    const files = fs.readdirSync(startingDirectory).map(file => path.join(startingDirectory, file))

    for (const extractor of extractors) {
      if (extractor.test(files)) {
        return new extractor.class(configService, startingDirectory, files, download)
      }
    }
  }
}
