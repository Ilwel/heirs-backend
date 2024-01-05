import { type AuthCheckerInterface, type ResolverData } from 'type-graphql'
import { type IContext } from '../context'
import SessionRepository from '../graphql/resolvers/session/session.repository'
import { Service } from 'typedi'

@Service()
export class CustomAuthChecker implements AuthCheckerInterface<IContext> {
  constructor (
    // Dependency injection
    private readonly sessionRepository: SessionRepository
  ) {}

  async check ({ root, args, context, info }: ResolverData<IContext>, roles: string[]): Promise<boolean> {
    const user = await this.sessionRepository.getUser(context, context.token)

    return user.username != null
  }
}
