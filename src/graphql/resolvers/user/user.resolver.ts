import { Arg, Args, Authorized, Ctx, Mutation, Resolver, Subscription } from 'type-graphql'
import { Board, Friendship, Session, User } from '../../../../prisma/generated/type-graphql'
import { Service } from 'typedi'
import UserService, { CreateUser } from './user.service'
import { IContext } from '../../../context'
import { PrismaCatch } from '../../../decorators/catchs.decorator'
import { pubSub } from '../../../pubSub'
import SessionRepository from '../session/session.repository'
import { BoardRepository } from '../board/board.repository'

@Service()
@Resolver(of => User)
export default class UserResolver {
  constructor (
    private readonly userService: UserService,
    private readonly sessionRepository: SessionRepository,
    private readonly boardRepository: BoardRepository
  ) {}

  @Mutation(() => User)
  @PrismaCatch
  public async signUp (@Ctx() ctx: IContext, @Args() createUser: CreateUser): Promise<User | undefined> {
    const user = await this.userService.signUp(ctx, createUser)
    if (user.username.length > 0) {
      console.log('🦖 sweet! an user has been created')
    }
    return user
  }

  @Mutation(() => Session)
  @PrismaCatch
  public async signIn (@Ctx() ctx: IContext, @Args() signInUser: CreateUser): Promise<Session | undefined> {
    const session = await this.userService.signIn(ctx, signInUser)
    if (session.token.length > 0) {
      console.log('🦖 sweet! an user logged in')
    }
    return session
  }

  @Mutation(() => Board)
  @Authorized()
  public async createMyBoard (@Ctx() ctx: IContext): Promise<Board> {
    const board = await this.boardRepository.createBoardFromToken(ctx, ctx.token)
    return board
  }

  @Mutation(() => String)
  @Authorized()
  public async deleteMyBoard (@Ctx() ctx: IContext, @Arg('id') id: string): Promise<string> {
    const removed = await this.boardRepository.removeBoardFromToken(ctx, ctx.token, id)
    return removed
  }

  @Mutation(() => String)
  public test (): string {
    pubSub.publish('FRIENDS', 'testing')
    return 'testing'
  }

  @Subscription(() => [Friendship], {
    topics: 'FRIENDS'
  })
  @Authorized()
  public async getFriends (@Ctx() ctx: IContext): Promise<Friendship [] | undefined> {
    return (await this.sessionRepository.getUserWithFriends(ctx, ctx.token)).following
  }
}
