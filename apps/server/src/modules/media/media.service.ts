import { Genre, PrismaClient, GenreMedia, Media, MediaType } from '@fdl/data'
import slugify from 'slugify'
import { Service } from 'typedi'
import { ulid } from 'ulidx'
import { TmdbService } from '../tmdb/tmdb.service'
import { CreateMediaByImdb, CreateMediaArgs, CreateMediaByTmdb } from './media.schema'

export type MediaServiceResponse = Media & {
  genres: GenreMedia &
    {
      genre: Genre
    }[]
}

@Service()
export class MediaService {
  constructor(private readonly prisma: PrismaClient, private readonly tmdbService: TmdbService) {}

  async find(args: CreateMediaArgs) {
    console.log(args)
    const imdbId = (args as CreateMediaByImdb).imdbId
    const tmdbId = (args as CreateMediaByTmdb).tmdbId
    const where = imdbId ? { imdbId } : { tmdbId }

    return this.prisma.media.findUnique({
      where,
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    })
  }

  async findOrCreate(args: CreateMediaArgs) {
    return (await this.find(args)) || (await this.create(args))
  }

  async create(args: CreateMediaArgs) {
    // TODO: we should get imdbId via the byId method as well

    let data: any
    const imdb = (args as CreateMediaByImdb).imdbId
    const tmdb = (args as CreateMediaByTmdb).tmdbId
    if (imdb) {
      data = await this.tmdbService.byImdb(imdb)
    }

    if (!data && tmdb) {
      data =
        (args as CreateMediaByTmdb).type === MediaType.MOVIE
          ? await this.tmdbService.getMovieById(tmdb)
          : await this.tmdbService.getSeriesById(tmdb)
    }
    // const data = args.imdbId ? await this.tmdbService.byImdb(args.imdbId) : await this.tmdbService

    if (!data) {
      console.log('no data for', args)
      return
    }

    let genres: Genre[] = []
    if (data.genres?.length > 0) {
      genres = await Promise.all(
        data.genres.map(name =>
          this.prisma.genre.upsert({
            where: {
              name,
            },
            create: {
              id: ulid(),
              name,
            },
            update: {},
          }),
        ),
      )
    }
    console.log(data)

    const id = ulid()
    const media = await this.prisma.media.create({
      data: {
        id,
        imdbId: data.imdbId,
        tmdbId: data.tmdbId,
        title: data.title,
        slug: slugify(data.title).toLowerCase(),
        type: data.type,
        date: data.date,
        blurb: data.blurb,
        poster: data.poster,
        backdrop: data.backdrop,
        tagline: data.tagline,
        originalLanguage: data.originalLanguage,
        audienceRatingAverage: data.rating?.average,
        audienceRatingVotes: data.rating?.votes,
        trailer: data.trailer,
      },
    })

    await this.prisma.genreMedia.createMany({
      data: genres.map(genre => ({
        mediaId: id,
        genreId: genre.id,
      })),
    })

    return this.find(args)
  }
}
