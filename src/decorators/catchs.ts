import { Prisma } from '@prisma/client'
import Catch from 'catch-decorator'
import { GraphQLError } from 'graphql'

const PrismaCatch = Catch(Prisma.PrismaClientKnownRequestError, (error: any) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error('😥 an error ocurrend in prisma')
    if (error.code === 'P2002') {
      console.error(`😥 code: ${error.code}`)
      console.error('😥 message: Unique constraint failed')
      throw new GraphQLError('😥 [PRISMA] unique constraint failed', {
        extensions: {
          code: `PRISMA_${error.code}`,
          name: error.name,
          fullMessage: error.message,
          stack: error.stack
        }
      })
    } else {
      console.error(`😥 code: ${error.code}`)
      console.error('😥 message: uncaught prisma error')
      throw new GraphQLError('😥 [PRISMA] uncaught prisma error', {
        extensions: {
          code: `PRISMA_${error.code}`,
          name: error.name,
          fullMessage: error.message,
          stack: error.stack
        }
      })
    }
  }
})

const ServerCatch = Catch(Error, (error: any) => {
  console.error('😥 oh no! an uncaught error ocurred!')
  if (error instanceof Error) {
    console.error(`😥 here's the message: ${error?.message}`)
  } else {
    console.error(`😥 there's no message, here the whole thing: ${error}`)
  }
})

export {
  PrismaCatch,
  ServerCatch
}
