import { Download } from '@fdl/downloader'
import { PrismaClient } from '@prisma/client'
import { Service } from 'typedi'
import { DirectoryService } from '../directory/directory.service'
import { ExtractionService } from '../extraction/extraction.service'
import { CreateDownloadArgs } from './download.schema'

@Service()
export class DownloadService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly directoryService: DirectoryService,
    private readonly extractionService: ExtractionService,
  ) {}

  async startDownload(args: CreateDownloadArgs) {
    const downloadable = await this.prisma.downloadable.findFirst({
      where: {
        id: args.downloadableId,
      },
      include: {
        urls: true,
        media: true,
      },
    })

    const downloadDirectory = this.directoryService.getDownloadDirectory(downloadable)

    const downloads: Download[] = []
    for (const url of downloadable.urls) {
      downloads.push(
        new Download(url.url, {
          tempDir: downloadDirectory,
          downloadDir: downloadDirectory,
        }),
      )
    }

    await Promise.all(downloads.map(download => download.start()))

    console.log('done downloading!')

    const extractor = this.extractionService.extract(downloadDirectory, downloadable)
    extractor.on('progress', progress => console.log(progress))
  }
}
