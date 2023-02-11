import { PrismaClient } from '@fdl/data'
import { randomUUID } from 'crypto'
import { Service } from 'typedi'
import { ulid } from 'ulidx'
import { CreateDownloadableArgs } from './downloadable.schema'

@Service()
export class DownloadableService {
  constructor(private readonly prisma: PrismaClient) {}

  async addDownloadable(args: CreateDownloadableArgs) {
    console.log(args)
    const downloadable = await this.prisma.downloadable.create({
      data: {
        id: ulid(),
        season: args.season,
        episode: args.episode,
        guid: args.guid || randomUUID(),
        title: args.title,
        referrer: args.referrer,
        media: {
          connect: {
            id: args.mediaId,
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

    return downloadable
  }
}
