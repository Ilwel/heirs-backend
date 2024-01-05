import { Service } from 'typedi'
import { type Session, type User } from '../../../../prisma/generated/type-graphql'
import { type IContext } from '../../../context'
import { ArgsType, Field } from 'type-graphql'
import bcrypt from 'bcrypt'
import { createUserPrismaQuery, findUserWhereUsernamePrismaQuery } from '../../prisma-queries/user.queries'

import { userNotFoundLogAndError } from '../../../logs/error.log'
import { createSessionAndConnectUserWhereUsernamePrismaQuery, findFirstSessionWhereUsernameAndNotExpiredPrismaQuery } from '../../prisma-queries/sesion.queries'

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

  async signIn (ctx: IContext, signInUser: CreateUser): Promise<Session> {
    const user = await ctx.prisma.user.findUnique({
      where: findUserWhereUsernamePrismaQuery(signInUser.username)
    })
    if ((user?.username) == null) {
      const error = userNotFoundLogAndError()
      throw error
    }
    const compare = await bcrypt.compare(signInUser.password, user.password) as boolean
    if (compare) {
      const Session = await this.genSession(ctx, signInUser)
      return Session
    } else {
      const error = userNotFoundLogAndError()
      throw error
    }
  }

  private async genSession (ctx: IContext, signInUser: CreateUser): Promise<Session> {
    const session = await ctx.prisma.session.findFirst({
      where: findFirstSessionWhereUsernameAndNotExpiredPrismaQuery(signInUser.username)
    })
    if ((session?.token) != null) {
      return session
    } else {
      const newSession = await ctx.prisma.session.create({
        data: createSessionAndConnectUserWhereUsernamePrismaQuery(signInUser.username)
      })
      return newSession
    }
  }

  private async hash (toHash: string): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(toHash, salt)
    return hashed
  }
}
