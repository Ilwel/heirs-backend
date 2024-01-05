import { Authorized, buildSchema } from 'type-graphql'
import resolvers from './graphql/resolvers'
import { type ResolversEnhanceMap, relationResolvers, applyResolversEnhanceMap } from '../prisma/generated/type-graphql'
import { startStandaloneServer } from '@apollo/server/standalone'
import { ApolloServer } from '@apollo/server'
import { context } from './context'
import Container, { Service } from 'typedi'
import { ServerCatch } from './decorators/catchs.decorator'
import jobs from './jobs'
import { CustomAuthChecker } from './auth/auth.checker'

interface IStartServer {
  server: ApolloServer
  url: string
}

export default class App {
  @ServerCatch
  public async start (): Promise<IStartServer | undefined> {
    const resolversEnhanceMap: ResolversEnhanceMap = {
      Board: {
        createOneBoard: [Authorized()],
        updateOneBoard: [Authorized()]
      },
      Player: {
        updateManyPlayer: [Authorized('ADMIN')]
      }
    }

    applyResolversEnhanceMap(resolversEnhanceMap)

    for (const realtion of relationResolvers) {
      Service()(realtion)
    }

    const schema = await buildSchema({
      resolvers: [...resolvers, ...relationResolvers],
      validate: false,
      container: Container,
      authChecker: CustomAuthChecker
    })

    const server = new ApolloServer({
      schema
    })

    const { url } = await startStandaloneServer(server, {
      context,
      listen: { port: 3000 }
    })

    jobs()

    console.log(`🦖 sweet! the server is working at ${url}`)

    return { server, url }
  }

  public async stop (startServer: IStartServer): Promise<void> {
    console.log(`😴 stopping the process at ${startServer.url}`)
    await startServer.server.stop()
  }
}
