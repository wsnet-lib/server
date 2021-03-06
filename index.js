const { start } = require('./gws');

// Start the server
start({
  port: process.env.PORT,
  behindProxy: process.env.BEHIND_PROXY,
  onListen({ address }) {
    console.info(`[SERVER] Ready on ${address}`);
  }
});
