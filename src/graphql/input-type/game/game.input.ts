import { Field, InputType } from 'type-graphql'

@InputType()
export class GameInput {
  @Field(() => String, { nullable: true })
    id!: string

  @Field(() => [PlayerType], { nullable: true })
    players!: PlayerType []

  @Field(() => String, { nullable: true })
    status!: string

  @Field(() => Number, { nullable: true })
    turnPlayer!: number
}

@InputType()
export class UserInput {
  @Field(() => String, {
    nullable: false
  })
    id!: string

  @Field(() => String, {
    nullable: false
  })
    username!: string
}

@InputType()
export class PlayerType {
  @Field(() => String, { nullable: true })
    money!: string

  @Field(() => String, { nullable: true })
    square!: string

  @Field(() => Boolean, { nullable: true })
    playable!: boolean

  @Field(() => UserInput)
    user!: UserInput

  @Field(() => String, { nullable: true })
    role!: 'ADMIN' | 'PLAYER' | 'SPECTATOR'
}
