const { start } = require('./gws');

// Start the server
start({
  port: process.env.PORT,
  onListen({ address }) {
    console.info(`[SERVER] Ready on ${address}`);
  }
});
