import { Downloadable, DownloadableUrl, Media } from '@prisma/client'
import { Service } from 'typedi'
import { DirectoryService } from '../directory/directory.service'
import { ExtractorFactory } from './extraction.factory'
import fs from 'fs'
import path from 'path'
import { ConfigService } from '../config/config.service'

@Service()
export class ExtractionService {
  constructor(
    private readonly directoryService: DirectoryService,
    private readonly configService: ConfigService,
  ) {}

  extract(
    downloadDirectory: string,
    downloadable: Downloadable & { media: Media; urls: DownloadableUrl[] },
  ) {
    const finalDirectory = this.directoryService.getDownloadableMediaDirectory(downloadable)

    const extractor = ExtractorFactory.getExtractor(
      this.configService,
      downloadDirectory,
      downloadable,
    )
    extractor.extract(finalDirectory)

    return extractor
  }
}
