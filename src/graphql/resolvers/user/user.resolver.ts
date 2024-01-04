import { Args, Ctx, Mutation, Resolver } from 'type-graphql'
import { type Token, User } from '../../../../prisma/generated/type-graphql'
import { Service } from 'typedi'
import UserService, { CreateUser } from './user.service'
import { IContext } from '../../../context'
import { PrismaCatch } from '../../../decorators/catchs.decorator'

@Service()
@Resolver(of => User)
export default class UserResolver {
  constructor (
    private readonly userService: UserService
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

  @Mutation(() => User)
  @PrismaCatch
  public async signIn (@Ctx() ctx: IContext, @Args() signInUser: CreateUser): Promise<Token | undefined> {
    const token = await this.userService.signIn(ctx, signInUser)
    if (token.session.length > 0) {
      console.log('🦖 sweet! an user logged in')
    }
    return token
  }
}
