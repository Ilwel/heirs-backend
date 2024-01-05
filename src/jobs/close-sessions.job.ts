import { prisma } from '../context'

export async function closeSessionsJob (): Promise<void> {
  console.log('🦖 sweet! we closing all the server sessions now')
  console.log('🦖 this job happens every 8 hours')
  const ctx = { prisma }
  const sessions = await ctx.prisma.session.findMany({
    where: {
      expired: false
    }
  })

  for (const session of sessions) {
    const hoursDif = Math.abs(new Date().getTime() - session.createdAt.getTime()) / 36e5
    console.log('🦖 hours dif: ', hoursDif)
    if (hoursDif >= 8) {
      await ctx.prisma.session.update({
        where: {
          token: session.token
        },
        data: {
          expired: true
        }
      })
    }
  }
}
