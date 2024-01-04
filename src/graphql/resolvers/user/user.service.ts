import { Service } from 'typedi'
import { type Token, type User } from '../../../../prisma/generated/type-graphql'
import { type IContext } from '../../../context'
import { ArgsType, Field } from 'type-graphql'
import bcrypt from 'bcrypt'
import { createUserPrismaQuery, findUserWhereUsernamePrismaQuery } from '../../prisma-queries/user.queries'
import { createTokenAndConnectUserWhereUsernamePrismaQuery, findFirstTokenWhereUsernameAndNotExpiredPrismaQuery } from '../../prisma-queries/token.queries'
import { userNotFoundLogAndError } from '../../../logs/error.log'

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
    const userCreated = await ctx.prisma.user.create({
      data: createUserPrismaQuery(createUser.username, await this.hash(createUser.password))
    })
    return userCreated
  }

  async signIn (ctx: IContext, signInUser: CreateUser): Promise<Token> {
    const user = await ctx.prisma.user.findUnique({
      where: findUserWhereUsernamePrismaQuery(signInUser.username)
    })
    if ((user?.username) == null) {
      const error = userNotFoundLogAndError()
      throw error
    }
    const compare = await bcrypt.compare(signInUser.password, user.password) as boolean
    if (compare) {
      const token = await this.genToken(ctx, signInUser)
      return token
    } else {
      const error = userNotFoundLogAndError()
      throw error
    }
  }

  private async genToken (ctx: IContext, signInUser: CreateUser): Promise<Token> {
    const token = await ctx.prisma.token.findFirst({
      where: findFirstTokenWhereUsernameAndNotExpiredPrismaQuery(signInUser.username)
    })
    if ((token?.session) != null) {
      return token
    } else {
      const newToken = await ctx.prisma.token.create({
        data: createTokenAndConnectUserWhereUsernamePrismaQuery(signInUser.username)
      })
      return newToken
    }
  }

  private async hash (toHash: string): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(toHash, salt)
    return hashed
  }
}
