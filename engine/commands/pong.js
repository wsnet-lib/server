/**
 * Handle the pong message from the client
 * (UDP-only command)
 */
exports.handler = ({ client, options }) => {
  const onDebug = options.onDebug || console.debug;
  onDebug(`Received pong from client ${client.state.ip}`);
  client.isAlive = true;
  client.pinged = false;
};
