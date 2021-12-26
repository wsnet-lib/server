/**
 * Attach event listeners and ping handlers to the server
 */
module.exports = ({ server, options }) => {
  const onDebug = options.onDebug || console.debug;
  const onServerError = options.onServerError || console.error;

  // Ping handler
  const interval = setInterval(() => {
    for (const client of server.clients) {
      if (!client.isAlive) {
        onDebug(`Pong event not received from client ${client.state.ip}, gracefully closing its connection`);
        client.close();
        continue;
      }

      // Only send a ping to this client if the server is not already waiting for the pong
      if (!client.pinged) {
        client.isAlive = false;
        onDebug(`Sending ping message to the client ${client.state.ip}`);
        client.ping();
        client.pinged = true;
      }
    }
  }, options.pingInterval || 3000);

  server.on('close', () => {
    console.log('ON CLOSE');
    clearInterval(interval);
    options.onClose && options.onClose();
  });

  server.on('listening', () => {
    const info = server.address();
    options.onListen && options.onListen({ address: `${info.address}:${info.port}` });
  });

  server.on('error', onServerError);
};
