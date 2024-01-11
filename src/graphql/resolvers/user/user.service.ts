import { Service } from 'typedi'
import { type Session, type User } from '../../../../prisma/generated/type-graphql'
import { type IContext } from '../../../context'
import { ArgsType, Field } from 'type-graphql'
import bcrypt from 'bcrypt'
import { userNotFoundLogAndError } from '../../../logs/error.log'
import { UserRepository } from './user.repository'
import SessionRepository from '../session/session.repository'

@ArgsType()
export class CreateUser {
  @Field(() => String)
    username!: string

  @Field(() => String)
    password!: string
}

@Service()
export default class UserService {
  constructor (
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository
  ) {}

  async signUp (ctx: IContext, createUser: CreateUser): Promise<User> {
    return await this.userRepository.createUser(ctx, createUser)
  }

  async signIn (ctx: IContext, signInUser: CreateUser): Promise<Session> {
    const user = await this.userRepository.findUserByUsername(ctx, signInUser.username)
    const compare = await bcrypt.compare(signInUser.password, user.password) as boolean
    if (compare) {
      const session = await this.sessionRepository.createSession(ctx, signInUser)
      return session
    } else {
      const error = userNotFoundLogAndError()
      throw error
    }
  }
}
