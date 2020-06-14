const { errors } = require('./errors');
const { commandHandlers } = require('../commands');
const { commandIds } = require('./commandIds');

/**
 * Execute the command based on the payload event ID
 * @param {WebSocket.Server} server
 * @param {WebSocket.Client} client
 * @param {Buffer} data
 */
exports.execCommand = (server, client, data) => {
  const commandId = data[0];
  const command = commandHandlers[commandId];

  /**
   * Send an error to the sender using the error commandId
   * @param {Number} errorId
   */
  const sendError = (errorId) => {
    const errorResp = Buffer.alloc(2);
    errorResp[0] = commandIds.error;
    errorResp[1] = errorId;
    client.send(errorResp);
  };

  /**
   * Send an error to the sender using the incoming commandId
   * @param {Number} errorId
   */
  const confirmError = (errorId) => {
    const errorResp = Buffer.alloc(2);
    errorResp[0] = commandId;
    errorResp[1] = errorId;
    client.send(errorResp);
  };

  // Send an error if the command does not exists
  if (!command) return sendError(errors.commandNotFound);

  // Execute the command
  return command({
    data,
    server,
    client,
    state: client.state,
    commandId,
    lobby: client.state.lobby,
    sendError,
    confirmError,

    /**
     * Send the confirmation to the sender
     */
    sendConfirm: () => {
      const confirm = Buffer.alloc(2);
      confirm[0] = commandId;
      confirm[1] = errors.noError;
      client.send(confirm);
    },

    /**
     * Broadcast the message to all lobby clients, except the sender one.
     * @param {Buffer} response
     */
    sendBroadcast: (response) => {
      const { players } = client.state.lobby;
      for (let i = 0, len = players.length; i < len; i++) {
        const player = players[i];
        client !== player && player.send(response);
      }
    }
  });
};
