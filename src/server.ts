import 'reflect-metadata'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { buildSchema } from 'type-graphql'
import { PrismaClient } from '@prisma/client'
import { resolvers } from '../prisma/generated/type-graphql'

interface IContext {
  prisma: PrismaClient
}

const prisma = new PrismaClient()

export const context = async (): Promise<IContext> => {
  const context = {
    prisma
  }

  return context
}

// eslint-disable-next-line
(async function init () {
  const schema = await buildSchema({
    resolvers: [...resolvers],
    validate: false
  })

  const server = new ApolloServer({
    schema
  })

  const { url } = await startStandaloneServer(server, {
    context,
    listen: { port: 4000 }
  })

  console.log(url)
})()
