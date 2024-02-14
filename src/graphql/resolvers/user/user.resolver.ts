import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver, Root, Subscription } from 'type-graphql'
import { Session, User } from '../../../../prisma/generated/type-graphql'
import { Service } from 'typedi'
import UserService, { CreateUser } from './user.service'
import { IContext } from '../../../context'
import { PrismaCatch } from '../../../decorators/catchs.decorator'
import SessionRepository from '../session/session.repository'
import { Game, GameService } from '../../../game/game.service'
import { GameInput } from '../../input-type/game/game.input'

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
  @PrismaCatch
  public async createMyGame (@Ctx() ctx: IContext): Promise<Game> {
    const board = await this.gameService.createGame(ctx, ctx.token)
    return board
  }

  @Mutation(() => String)
  @Authorized()
  @PrismaCatch
  public async deleteMyGame (@Ctx() ctx: IContext, @Arg('id') id: string): Promise<string> {
    const removed = await this.gameService.deleteGame(ctx, ctx.token, id)
    return removed
  }

  @Query(() => Game)
  @PrismaCatch
  public async getGame (@Arg('id')id: string): Promise<Game> {
    const game = await this.gameService.getGame(id)
    return game
  }

  @Mutation(() => Game)
  @Authorized()
  @PrismaCatch
  public async registerOnGame (@Ctx() ctx: IContext, @Arg('id') id: string): Promise<Game> {
    const connected = await this.gameService.registerOnGame(ctx, ctx.token, id)
    return connected
  }

  @Mutation(() => String)
  @Authorized()
  public async changeGameState (@Arg('game') game: GameInput, @Ctx()ctx: IContext): Promise<string> {
    const updated = await this.gameService.changeGameState(game, ctx, ctx.token)
    return updated
  }

  @Query(() => [Game])
  @Authorized()
  @PrismaCatch
  public async queryFriendGames (@Ctx() ctx: IContext): Promise<Game []> {
    const me = await this.sessionRepository.getUser(ctx, ctx.token)
    const games = await this.gameService.listAllFriendsGames(me.id)
    return games
  }

  @Subscription(() => [Game], {
    topics: ({ context }) => context.username
  })
  @Authorized()
  @PrismaCatch
  public async getFriendsGames (@Ctx() ctx: IContext): Promise<Game []> {
    const me = await this.sessionRepository.getUser(ctx, ctx.token)
    const games = await this.gameService.listAllFriendsGames(me.id)
    return games
  }

  @Subscription(() => Game, {
    topics: ({ args }) => args.id
  })
  @Authorized()
  @PrismaCatch
  public async connectOnGame (@Arg('id') id: string, @Root() game: Game): Promise<Game> {
    return game
  }
}
