import { ArgsType, Field, ID, ObjectType } from 'type-graphql'

@ObjectType()
export class Downloadable {}

@ArgsType()
export class CreateDownloadArgs {
  @Field(() => ID)
  downloadableId: string
}
