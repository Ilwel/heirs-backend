import cron from 'node-cron'
import { healthJob } from './health.job'
import { closeSessionsJob } from './close-sessions.job'

export default function jobs (): void {
  cron.schedule('*/10 * * * *', healthJob)
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  cron.schedule('1 */8 * * *', closeSessionsJob)
}
