/**
 * Attach event listeners and ping handlers to the server
 */
module.exports = ({ server, options }) => {
  const onDebug = options.onDebug || console.debug;
  const onServerError = options.onServerError || console.error;
  const pongDisconnectTimer = options.pongDisconnectTimer || 10000;

  // Ping handler
  const interval = setInterval(() => {
    const now = +new Date();
    for (const client of server.clients) {
      if (client.closed) continue;

      if (now - client.isAliveAt > pongDisconnectTimer) {
        onDebug(`Pings not received from client ${client.state.ip}`);
        if (!client.closed) client.close();
        continue;
      }

      if (server.protocol !== 'UDP') {
        onDebug(`◯ 🡆  Sending ping to client ${client.state.ip}`);
        client.ping();
      }
    }
  }, options.pingInterval || 1000);

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
