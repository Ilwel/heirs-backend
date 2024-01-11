import { Service } from 'typedi'
import { type CreateUser } from './user.service'
import { createUserPrismaQuery, findUserWhereUsernamePrismaQuery } from '../../prisma-queries/user.queries'
import { Hash } from '../../../hash/hash'
import { type User } from '../../../../prisma/generated/type-graphql'
import { type IContext } from '../../../context'
import { userNotFoundLogAndError } from '../../../logs/error.log'

type RepoUser = Omit<User, 'password'> & { password: string }

@Service()
export class UserRepository {
  constructor (
    private readonly hash: Hash
  ) {}

  public async createUser (ctx: IContext, createUser: CreateUser): Promise<User> {
    const userCreated = await ctx.prisma.user.create({
      data: createUserPrismaQuery(createUser.username, await this.hash.hash(createUser.password))
    })
    return userCreated
  }

  public async findUserByUsername (ctx: IContext, username: string): Promise<RepoUser> {
    const user = await ctx.prisma.user.findUnique({
      where: findUserWhereUsernamePrismaQuery(username)
    })
    if ((user?.username) == null) {
      const error = userNotFoundLogAndError()
      throw error
    }
    return user
  }
}
