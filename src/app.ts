import { Authorized, buildSchema } from 'type-graphql'
import resolvers from './graphql/resolvers'
import { type ResolversEnhanceMap, relationResolvers, applyResolversEnhanceMap } from '../prisma/generated/type-graphql'
import { ApolloServer } from '@apollo/server'
import { context } from './context'
import Container, { Service } from 'typedi'
import { ServerCatch } from './decorators/catchs.decorator'
import jobs from './jobs'
import { CustomAuthChecker } from './auth/auth.checker'
import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import cors from 'cors'
import { expressMiddleware } from '@apollo/server/express4'
import { pubSub } from './pubSub'

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
      authChecker: CustomAuthChecker,
      pubSub
    })

    const app = express()
    const httpServer = createServer(app)

    const wsServer = new WebSocketServer({
      server: httpServer,
      path: '/graphql'
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const serverCleanup = useServer({ schema, context }, wsServer)

    const server = new ApolloServer({
      schema,
      plugins: [
        // Proper shutdown for the HTTP server.
        ApolloServerPluginDrainHttpServer({ httpServer }),

        // Proper shutdown for the WebSocket server.
        {
          async serverWillStart () {
            return {
              async drainServer () {
                await serverCleanup.dispose()
              }
            }
          }
        }
      ]
    })

    await server.start()
    app.use('/graphql',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      cors<cors.CorsRequest>(),
      express.json(),
      expressMiddleware(server, {
        context
      })
    )

    httpServer.listen(3000, () => {
      console.log('🦖 sweet! the server is working at http://localhost:3000/graphql')
    })

    jobs()

    return { server, url: 'http://localhost:3000' }
  }

  public async stop (startServer: IStartServer): Promise<void> {
    console.log(`😴 stopping the process at ${startServer.url}`)
    await startServer.server.stop()
  }
}
