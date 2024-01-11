import { Args, Authorized, Ctx, Mutation, Resolver, Subscription } from 'type-graphql'
import { Friendship, Session, User } from '../../../../prisma/generated/type-graphql'
import { Service } from 'typedi'
import UserService, { CreateUser } from './user.service'
import { IContext } from '../../../context'
import { PrismaCatch } from '../../../decorators/catchs.decorator'
import { pubSub } from '../../../pubSub'
import SessionRepository from '../session/session.repository'

@Service()
@Resolver(of => User)
export default class UserResolver {
  constructor (
    private readonly userService: UserService,
    private readonly sessionRepository: SessionRepository
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
