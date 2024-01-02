import 'reflect-metadata'
import coreApp from './app'

// eslint-disable-next-line
(async function init () {
  await coreApp.start()
})()
