import { buildSchema } from 'type-graphql'
import resolvers from './graphql/resolvers'
import { relationResolvers } from '../prisma/generated/type-graphql'
import { startStandaloneServer } from '@apollo/server/standalone'
import { ApolloServer } from '@apollo/server'
import { context } from './context'
import Container, { Service } from 'typedi'
import { ServerCatch } from './decorators/catchs'

interface IStartServer {
  server: ApolloServer
  url: string
}

export default class App {
  @ServerCatch
  public async start (): Promise<IStartServer | undefined> {
    for (const realtion of relationResolvers) {
      Service()(realtion)
    }

    const schema = await buildSchema({
      resolvers: [...resolvers, ...relationResolvers],
      validate: false,
      container: Container
    })

    const server = new ApolloServer({
      schema
    })

    const { url } = await startStandaloneServer(server, {
      context,
      listen: { port: 3000 }
    })

    console.log(`🦖 sweet! the server is working at ${url}`)

    return { server, url }
  }

  public async stop (startServer: IStartServer): Promise<void> {
    console.log(`😴 stopping the process at ${startServer.url}`)
    await startServer.server.stop()
  }
}
