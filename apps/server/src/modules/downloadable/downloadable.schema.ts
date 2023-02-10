import { ArgsType, Field, Int, ObjectType } from 'type-graphql'
import { CreateMediaArgs } from '../media/media.schema'

@ObjectType()
export class Downloadable {}

@ArgsType()
export class CreateDownloadableArgs extends CreateMediaArgs {
  @Field(() => Int, { nullable: true })
  season?: number

  @Field(() => Int, { nullable: true })
  episode?: number

  @Field(() => [String])
  urls: string[]

  @Field()
  title: string

  @Field()
  referrer: string
}
