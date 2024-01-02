import { Args, Ctx, Mutation, Resolver } from 'type-graphql'
import { User } from '../../../../prisma/generated/type-graphql'
import { Service } from 'typedi'
import UserService, { CreateUser } from './user.service'
import { IContext } from '../../../context'

@Service()
@Resolver(of => User)
export default class UserResolver {
  constructor (
    private readonly userService: UserService
  ) {}

  @Mutation(() => User)
  public async signUp (@Ctx() ctx: IContext, @Args() createUser: CreateUser): Promise<User> {
    const user = await this.userService.signUp(ctx, createUser)
    return user
  }
}
