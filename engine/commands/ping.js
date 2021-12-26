const { commandIds } = require('../lib/commandIds');

/**
 * Handle the ping message from the client
 * (UDP-only command)
 */
exports.handler = ({ client, data, options }) => {
  const onDebug = options.onDebug || console.debug;
  onDebug(`Received ping from client ${client.state.ip}. Sending back a pong message`);

  // Send back a pong message
  data[0] = commandIds.pong;
  client.send(data);
};
