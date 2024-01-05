import { context } from '../context'

export async function closeSessionsJob (): Promise<void> {
  console.log('🦖 sweet! we closing all the server sessions now')
  console.log('🦖 this job happens every 8 hours')
  const ctx = await context()
  const tokens = await ctx.prisma.token.findMany({
    where: {
      expired: false
    }
  })

  for (const token of tokens) {
    const hoursDif = Math.round(Math.abs(new Date().getTime() - token.createdAt.getTime()) / 36e5)
    console.log('🦖 hours dif: ', hoursDif)
    if (hoursDif > 8) {
      await ctx.prisma.token.update({
        where: {
          session: token.session
        },
        data: {
          expired: true
        }
      })
    }
  }
}
