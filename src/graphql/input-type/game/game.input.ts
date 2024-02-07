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

  @Field(() => [ChatMsgInput])
    chat!: ChatMsgInput []
}

@InputType()
export class ChatMsgInput {
  @Field(() => String)
    msg!: string

  @Field(() => String)
    username!: string

  @Field(() => String)
    createdAt!: string
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
  @Field(() => Number, { nullable: true })
    money!: number

  @Field(() => String, { nullable: true })
    square!: string

  @Field(() => Boolean, { nullable: true })
    playable!: boolean

  @Field(() => UserInput)
    user!: UserInput

  @Field(() => String, { nullable: true })
    role!: 'ADMIN' | 'PLAYER' | 'SPECTATOR'
}
