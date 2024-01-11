import { type StandaloneServerContextFunctionArgument } from '@apollo/server/dist/esm/standalone'
import { PrismaClient } from '@prisma/client'
import { type ExecutionArgs } from 'graphql'
import { type SubscribeMessage, type Context } from 'graphql-ws'
import { type Extra } from 'graphql-ws/lib/use/ws'

export interface IContext {
  prisma: PrismaClient
  token: string
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
  const context = {
    prisma,
    token: ctx?.connectionParams?.authorization as string ?? ''
  }

  return context
}
