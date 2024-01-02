import { PrismaClient } from '@prisma/client'

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
