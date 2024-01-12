import { Arg, Args, Authorized, Ctx, Mutation, Resolver, Subscription } from 'type-graphql'
import { Session, User } from '../../../../prisma/generated/type-graphql'
import { Service } from 'typedi'
import UserService, { CreateUser } from './user.service'
import { IContext } from '../../../context'
import { PrismaCatch } from '../../../decorators/catchs.decorator'
import SessionRepository from '../session/session.repository'
import { Game, GameService } from '../../../game/game.service'

@Service()
@Resolver(of => User)
export default class UserResolver {
  constructor (
    private readonly userService: UserService,
    private readonly sessionRepository: SessionRepository,
    private readonly gameService: GameService
  ) {}

  @Mutation(() => User)
  @PrismaCatch
  public async signUp (@Ctx() ctx: IContext, @Args() createUser: CreateUser): Promise<User | undefined> {
    const user = await this.userService.signUp(ctx, createUser)
    return user
  }

  @Mutation(() => Session)
  @PrismaCatch
  public async signIn (@Ctx() ctx: IContext, @Args() signInUser: CreateUser): Promise<Session | undefined> {
    const session = await this.userService.signIn(ctx, signInUser)
    return session
  }

  @Mutation(() => Game)
  @Authorized()
  public async createMyBoard (@Ctx() ctx: IContext): Promise<Game> {
    const board = await this.gameService.createGame(ctx, ctx.token)
    return board
  }

  @Mutation(() => String)
  @Authorized()
  public async deleteMyBoard (@Ctx() ctx: IContext, @Arg('id') id: string): Promise<string> {
    const removed = await this.gameService.deleteGame(ctx, ctx.token, id)
    return removed
  }

  @Mutation(() => Game)
  @Authorized()
  public async connectToBoard (@Ctx() ctx: IContext, @Arg('id') id: string): Promise<Game> {
    const connected = await this.gameService.connectOnGame(ctx, ctx.token, id)
    return connected
  }

  @Subscription(() => [Game], {
    topics: ({ context }) => context.username
  })
  @Authorized()
  public async getFriendsGames (@Ctx() ctx: IContext): Promise<Game []> {
    const friendsRelations = (await this.sessionRepository.getUserWithFriends(ctx, ctx.token)).following
    const friends = friendsRelations?.map(item => item.whosFollowedBy)
    const games = this.gameService.listAllFriendsGames(friends as User [])
    return games
  }
}
