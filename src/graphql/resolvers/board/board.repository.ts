import { Service } from 'typedi'
import SessionRepository from '../session/session.repository'
import { type IContext } from '../../../context'
import { type Board } from '../../../../prisma/generated/type-graphql'
import { pubSub } from '../../../pubSub'

@Service()
export class BoardRepository {
  constructor (
    private readonly sessionRepository: SessionRepository
  ) {}

  public async createBoardFromToken (ctx: IContext, token: string): Promise<Board> {
    const user = await this.sessionRepository.getUser(ctx, token)
    const board = await ctx.prisma.board.create({
      data: {
        players: {
          create: {
            user: {
              connect: {
                id: user.id
              }
            }
          }
        }
      }
    })
    const userDetails = await ctx.prisma.user.findUnique({
      where: {
        id: user.id
      },
      include: {
        followedBy: {
          include: {
            whosFollowing: true
          }
        }
      }
    })
    if ((userDetails?.followedBy) != null) {
      for (const friend of userDetails.followedBy) {
        if ((friend.whosFollowing?.username) != null) {
          pubSub.publish(friend.whosFollowing?.username, 'my new board')
        }
      }
    }
    return board
  }

  public async removeBoardFromToken (ctx: IContext, token: string, id: string): Promise<string> {
    const user = await this.sessionRepository.getUser(ctx, token)
    const board = await ctx.prisma.board.findUnique({
      where: {
        id
      },
      include: {
        players: {
          include: {
            user: true
          }
        }
      }
    })
    if (board != null) {
      if (user.username !== board.players[0].user.username) {
        return 'unauthorized'
      } else {
        await ctx.prisma.player.deleteMany({
          where: {
            boardId: board.id
          }
        })
        await ctx.prisma.board.delete({
          where: {
            id: board.id
          }
        })
        const userDetails = await ctx.prisma.user.findUnique({
          where: {
            id: user.id
          },
          include: {
            followedBy: {
              include: {
                whosFollowing: true
              }
            }
          }
        })
        if ((userDetails?.followedBy) != null) {
          for (const friend of userDetails.followedBy) {
            if ((friend.whosFollowing?.username) != null) {
              pubSub.publish(friend.whosFollowing?.username, 'my new board')
            }
          }
        }
        return 'board removed'
      }
    } else {
      return 'board not found'
    }
  }
}
