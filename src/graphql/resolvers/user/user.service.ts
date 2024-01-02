import { Service } from 'typedi'
import { type User } from '../../../../prisma/generated/type-graphql'
import { type IContext } from '../../../context'
import { ArgsType, Field } from 'type-graphql'

@ArgsType()
export class CreateUser {
  @Field(() => String)
    username!: string

  @Field(() => String)
    password!: string
}

@Service()
export default class UserService {
  async signUp (ctx: IContext, createUser: CreateUser): Promise<User> {
    const userCreated = await ctx.prisma.user.create({ data: createUser })
    return userCreated
  }
}
