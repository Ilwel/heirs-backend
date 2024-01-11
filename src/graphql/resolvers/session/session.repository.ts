import { Service } from 'typedi'
import { type User } from '../../../../prisma/generated/type-graphql'
import { type IContext } from '../../../context'
import { sessionExpiredOrNotFound } from '../../../logs/error.log'

@Service()
export default class SessionRepository {
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
                whosFollowedBy: true
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
