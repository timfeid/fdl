import { Arg, Args, FieldResolver, Mutation, Resolver, Root } from 'type-graphql'
import { Service } from 'typedi'
import { GenreSchema } from '../genre/genre.schema'
import { CreateMediaArgs, MediaSchema } from './media.schema'
import { MediaService, MediaServiceResponse } from './media.service'

@Resolver(() => MediaSchema)
@Service()
export class MediaResolver {
  constructor(private readonly movieService: MediaService) {}

  // @Mutation(() => MediaSchema)
  // async createMedia(@Args() data: CreateMediaArgs) {
  //   return this.movieService.findOrCreate(data)
  // }

  @FieldResolver(() => [GenreSchema])
  genres(@Root() root: MediaServiceResponse) {
    return root.genres.map(genreMedia => genreMedia.genre)
  }

  @FieldResolver()
  poster(@Root() root: MediaServiceResponse) {
    return root.poster ? `https://image.tmdb.org/t/p/original${root.poster}` : null
  }

  @FieldResolver()
  backdrop(@Root() root: MediaServiceResponse) {
    return root.backdrop ? `https://image.tmdb.org/t/p/original${root.backdrop}` : null
  }
}
