import 'reflect-metadata'
import App from './app'

// eslint-disable-next-line
(async function init () {
  const app = new App()
  await app.start()
})()
