import 'reflect-metadata'
import App from './app'
import dotenv from 'dotenv'

// eslint-disable-next-line
(async function init () {
  dotenv.config()
  const app = new App()
  await app.start()
})()
