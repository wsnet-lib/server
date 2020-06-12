const { start } = require('./gws')

start({
  port: process.env.PORT,
  onListen() {
    console.info('[SERVER] Ready')
  }
})
