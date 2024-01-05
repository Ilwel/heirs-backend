import { type StandaloneServerContextFunctionArgument } from '@apollo/server/dist/esm/standalone'
import { PrismaClient } from '@prisma/client'

export interface IContext {
  prisma: PrismaClient
  token: string
}

export const prisma = new PrismaClient()

export const context = async ({ req }: StandaloneServerContextFunctionArgument): Promise<IContext> => {
  const context = {
    prisma,
    token: req.headers.authorization ?? ''
  }

  return context
}
