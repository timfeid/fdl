import { Download } from '@fdl/downloader'
import { MediaType, PrismaClient } from '@prisma/client'
import { Service } from 'typedi'
import { ulid } from 'ulidx'
import { MediaService } from '../media/media.service'
import { CreateDownloadableArgs } from './downloadable.schema'

@Service()
export class DownloadableService {
  constructor(private readonly prisma: PrismaClient, private readonly mediaService: MediaService) {}

  async addDownloadable(args: CreateDownloadableArgs) {
    // const download = new Download(url, {
    //   tempDir: '/Users/timfeid/nas/temp',
    //   downloadDir: '/Users/timfeid/nas',
    // })

    const media = await this.mediaService.findOrCreate({
      imdbId: args.imdbId,
    })

    console.log(media)

    // download.start()
    const downloadable = await this.prisma.downloadable.create({
      data: {
        id: ulid(),
        season: args.season,
        episode: args.episode,
        title: args.title,
        referrer: args.referrer,
        media: {
          connect: {
            id: media.id,
          },
        },
        urls: {
          createMany: {
            data: args.urls.map(url => ({
              id: ulid(),
              url,
            })),
          },
        },
      },
    })

    console.log('hello', downloadable)
    return downloadable
  }
}
