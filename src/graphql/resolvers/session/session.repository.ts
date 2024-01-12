import { Service } from 'typedi'
import { type User } from '../../../../prisma/generated/type-graphql'
import { type IContext } from '../../../context'
import { sessionExpiredOrNotFound } from '../../../logs/error.log'
import { createSessionAndConnectUserWhereUsernamePrismaQuery, findFirstSessionWhereUsernameAndNotExpiredPrismaQuery } from '../../prisma-queries/sesion.queries'
import { type CreateUser } from '../user/user.service'
import { type Session } from '@prisma/client'

@Service()
export default class SessionRepository {
  public async createSession (ctx: IContext, signInUser: CreateUser): Promise<Session> {
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

  public async getUser (ctx: IContext, token: string): Promise<User> {
    const session = await ctx.prisma.session.findFirst({
      where: {
        token,
        expired: false
      },
      include: {
        user: true
      }
    })
    if ((session?.token) == null) {
      const error = sessionExpiredOrNotFound()
      throw error
    }
    return session.user
  }

  public async getUserWithFriends (ctx: IContext, token: string): Promise<User> {
    const session = await ctx.prisma.session.findFirst({
      where: {
        token,
        expired: false
      },
      include: {
        user: {
          include: {
            following: {
              include: {
                whosFollowedBy: true,
                whosFollowing: true
              }
            },
            followedBy: {
              include: {
                whosFollowedBy: true,
                whosFollowing: true
              }
            }
          }
        }
      }
    })
    if ((session?.token) == null) {
      const error = sessionExpiredOrNotFound()
      throw error
    }
    return session.user
  }
}
