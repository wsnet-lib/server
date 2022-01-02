const { errors } = require('./errors');
const { commandHandlers } = require('../commands');
const { commandIds } = require('./commandIds');
const { appendUdpHeader } = require('./appendUdpHeader');
const { createNetBuffer } = require('./buffer');

/**
 * Execute the command based on the payload event ID
 * @param {WebSocket.Server} server
 * @param {WebSocket.Client} client
 * @param {Buffer} data
 * @param {Function} onGameMessage
 */
exports.execCommand = ({ server, client, data, onGameMessage, packetId, reliable }, options = {}) => {
  client.isAliveAt = +new Date();
  const commandId = data[0];
  const command = commandHandlers[commandId];

  // For UDP: increase the buffer size to automatically append the header
  const udpHeaderSize = packetId !== undefined ? 5 : 0;

  /**
   * Send an error to the sender
   * @param {Number} errorId
   */
  const sendError = (errorId) => {
    const errorResp = Buffer.allocUnsafe(2 + udpHeaderSize);
    errorResp[0] = commandIds.error;
    errorResp[1] = errorId;
    if (udpHeaderSize) appendUdpHeader(client, errorResp);
    client.send(errorResp);
  };

  /**
   * Send an error to the sender using the specified or initial commandId
   * @param {Number} errorId
   * @param {Number} [customCommandId]
   */
  const sendConfirmWithError = (errorId, customCommandId = undefined) => {
    const errorResp = Buffer.allocUnsafe(2 + udpHeaderSize);
    errorResp[0] = customCommandId === undefined ? commandId : customCommandId;
    errorResp[1] = errorId;
    if (udpHeaderSize) appendUdpHeader(client, errorResp);
    client.send(errorResp);
  };

  // Send an error if the command does not exists
  if (!command) return sendError(packetId, errors.commandNotFound);

  /**
   * Broadcast the message to all lobby clients, except the sender one.
   * @param {Buffer} response
   */
  const sendBroadcast = (response) => {
    const { players } = client.state.lobby;
    for (let i = 0, len = players.length; i < len; i++) {
      const player = players[i];
      client !== player && player.send(response);
    }
  };

  // Execute the command
  return command({
    data,
    server,
    options,
    client,
    onGameMessage,
    state: client.state,
    commandId,
    lobby: client.state.lobby,
    sendError,
    sendConfirmWithError,

    /**
     * Send the confirmation to the sender
     */
    sendConfirm: () => {
      const confirm = Buffer.allocUnsafe(2 + udpHeaderSize);
      confirm[0] = commandId;
      confirm[1] = errors.noError;
      if (udpHeaderSize) appendUdpHeader(client, confirm);
      client.send(confirm);
    },

    sendBroadcast, // @deprecated: use createBuffer()

    /**
     * Create a wrapper for the buffer creation
     * @param {Integer} size Buffer size
     * @param {Integer} [reliable] Reliable flag
     */
    createBuffer: (size, reliable = 2) => (createNetBuffer(client, sendBroadcast, udpHeaderSize, size, reliable)),

    // UDP data
    packetId,
    udpHeaderSize,
    appendUdpHeader: (data) => appendUdpHeader(client, data) // @deprecated: use createBuffer()
  });
};
