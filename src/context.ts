import { PrismaClient } from '@prisma/client'

export interface IContext {
  prisma: PrismaClient
}

const prisma = new PrismaClient()

export const context = async (): Promise<IContext> => {
  const context = {
    prisma
  }

  return context
}
