import { Args, Ctx, Mutation, Resolver } from 'type-graphql'
import { User } from '../../../../prisma/generated/type-graphql'
import { Service } from 'typedi'
import UserService, { CreateUser } from './user.service'
import { IContext } from '../../../context'
import { PrismaCatch } from '../../../decorators/catchs'

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
}
