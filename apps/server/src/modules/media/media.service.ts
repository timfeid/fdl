import { Genre, PrismaClient, GenreMedia, Media, MediaType } from "@prisma/client";
import slugify from "slugify";
import { Service } from "typedi";
import { ulid } from "ulidx";
import { TmdbService } from "../tmdb/tmdb.service";
import { CreateMediaArgs } from "./media.schema";

export type MediaServiceResponse = Media & {
  genres: GenreMedia & {
    genre: Genre
  }[]
}

@Service()
export class MediaService {
  constructor(private readonly prisma: PrismaClient, private readonly tmdbService: TmdbService) {}

  async find(args: CreateMediaArgs) {
    return this.prisma.media.findUnique({
      where: {
        imdbId: args.imdbId,
      },
      include: {
        genres: {
          include: {
            genre: true,
          }
        }
      },
    })
  }

  async findOrCreate(args: CreateMediaArgs) {
    return await this.find(args) || await this.create(args)
  }

  async create(args: CreateMediaArgs) {
    const data = await this.tmdbService.byImdb(args.imdbId)

    console.log(data)

    let genres: Genre[]
    if (data.genres.length > 0) {
      genres = await Promise.all(
        data.genres.map(name => this.prisma.genre.upsert({
          where: {
            name,
          },
          create: {
            id: ulid(),
            name,
          },
          update: {},
        }))
      )
    }

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
      }
    })

    await this.prisma.genreMedia.createMany({
      data: genres.map(genre => ({
        mediaId: id,
        genreId: genre.id,
      }))
    })

    return this.find(args)
  }
}
