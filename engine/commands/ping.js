/**
 * Handle the ping message from the client
 * (UDP-only command)
 */
exports.handler = ({ client, data, options }) => {
  // Send back a pong message
  client.send(data);

  const onDebug = options.onDebug || console.debug;
  onDebug(`🡄 ◯  ⬤ 🡆  Received ping from client ${client.state.ip}. Sending back a pong`);
};
