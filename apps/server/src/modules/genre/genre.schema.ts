import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class GenreSchema {
  @Field()
  name: string
}
