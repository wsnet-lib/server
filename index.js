const { start } = require('./gws');

// Start the server
start({
  port: process.env.PORT,
  onListen() {
    console.info('[SERVER] Ready');
  }
});
