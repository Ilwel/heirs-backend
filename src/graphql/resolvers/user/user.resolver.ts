import { Query, Resolver } from 'type-graphql'
import { User } from '../../../../prisma/generated/type-graphql'

@Resolver(of => User)
export default class UserResolver {
  @Query(() => String)
  getUser (): string {
    return 'User'
  }
}
