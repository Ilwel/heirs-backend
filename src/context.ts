import { type StandaloneServerContextFunctionArgument } from '@apollo/server/dist/esm/standalone'
import { PrismaClient } from '@prisma/client'
import { type ExecutionArgs } from 'graphql'
import { type SubscribeMessage, type Context } from 'graphql-ws'
import { type Extra } from 'graphql-ws/lib/use/ws'
import { sessionExpiredOrNotFound } from './logs/error.log'

export interface IContext {
  prisma: PrismaClient
  token: string
  username?: string
}

export const prisma = new PrismaClient()

export const context = async ({ req }: StandaloneServerContextFunctionArgument): Promise<IContext> => {
  const context = {
    prisma,
    token: req?.headers.authorization ?? ''
  }

  return context
}

type WsContextType = Context<Record<string, unknown> | undefined, Extra & Partial<Record<PropertyKey, never>>>

export const wsContext = async (ctx: WsContextType, msg: SubscribeMessage, args: ExecutionArgs): Promise<IContext> => {
  const session = await prisma.session.findFirst({
    where: {
      token: ctx?.connectionParams?.authorization ?? ' ',
      expired: false
    },
    include: {
      user: true
    }
  })
  if ((session?.token) == null) {
    const error = sessionExpiredOrNotFound()
    throw error
  }
  const context = {
    prisma,
    token: ctx?.connectionParams?.authorization as string ?? '',
    username: session.user.username
  }

  return context
}
