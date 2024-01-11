import { Service } from 'typedi'
import SessionRepository from '../session/session.repository'
import { type IContext } from '../../../context'
import { type Board } from '../../../../prisma/generated/type-graphql'

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
    if (board.id !== null) {
      return board
    } else {
      throw Error('deu ruim')
    }
  }
}
