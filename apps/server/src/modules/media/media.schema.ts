import { MediaType } from "@prisma/client";
import { ArgsType, Field, Int, ObjectType, registerEnumType } from "type-graphql";
import { GenreSchema } from "../genre/genre.schema";

registerEnumType(MediaType, {
  name: 'MediaType'
})

@ObjectType()
export class MediaSchema {
  @Field()
  id: string

  @Field()
  imdbId: string

  @Field()
  tmdbId: string

  @Field()
  title: string

  @Field()
  date: string

  @Field()
  blurb: string

  @Field()
  poster: string

  @Field()
  backdrop: string

  @Field({ nullable: true })
  tagline?: string

  @Field()
  originalLanguage: string

  @Field({ nullable: true })
  audienceRatingAverage?: string

  @Field({ nullable: true })
  audienceRatingVotes?: string

  @Field({ nullable: true })
  trailer?: string

  @Field(() => [GenreSchema])
  genres: GenreSchema[]
}

@ArgsType()
export class CreateMediaArgs {
  @Field()
  imdbId: string
}
