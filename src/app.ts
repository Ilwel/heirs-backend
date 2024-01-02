import { buildSchema } from 'type-graphql'
import resolvers from './graphql/resolvers'
import { relationResolvers } from '../prisma/generated/type-graphql'
import { startStandaloneServer } from '@apollo/server/standalone'
import { ApolloServer } from '@apollo/server'
import { context } from './context'

interface IStartServer {
  server: ApolloServer
  url: string
}

const start = async (): Promise<IStartServer | undefined> => {
  try {
    const schema = await buildSchema({
      resolvers: [...resolvers, ...relationResolvers],
      validate: false
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
  } catch (error: any) {
    console.log('😥 oh no! an uncaught error ocurred!')
    if (error instanceof Error) {
      console.log(`😥 here's the message: ${error?.message}`)
    } else {
      console.log(`😥 there's no message, here the whole thing: ${error}`)
    }
  }
}

const stop = async (startServer: IStartServer): Promise<void> => {
  console.log(`😴 stopping the process at ${startServer.url}`)
  await startServer.server.stop()
}

export default {
  start,
  stop
}
