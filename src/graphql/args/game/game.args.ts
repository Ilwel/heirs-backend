import { ArgsType, Field, InputType } from 'type-graphql'

@ArgsType()
export class GameArgs {
  @Field(() => String, { nullable: true })
    id!: string

  @Field(() => [PlayerType], { nullable: true })
    players!: PlayerType []

  @Field(() => String, { nullable: true })
    status!: string
}

@InputType()
export class PlayerType {
  @Field(() => String, { nullable: true })
    money!: string

  @Field(() => String, { nullable: true })
    square!: string

  @Field(() => Boolean, { nullable: true })
    playable!: boolean
}
