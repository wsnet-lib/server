const { errors } = require('./errors');
const { commandHandlers } = require('../commands');

const commandIds = {
  lobby_list: 0,
  lobby_create: 1,
  lobby_join: 2,
  lobby_leave: 3,
  lobby_allow_join: 4,
  lobby_kick: 5,
  lobby_transfer: 6,
  lobby_max_players: 7,
  game_message: 9,
  error: 10,
  lobby_join_auto: 11
};

/** Command IDs */
exports.commandIds = commandIds;

/**
 * Execute the command based on the payload event ID
 * @param {WebSocket.Server} server
 * @param {WebSocket.Client} client
 * @param {Buffer} data
 */
exports.execCommand = (server, client, data) => {
  const commandId = data.readUInt8(0);
  const command = commandHandlers[commandId];

  /**
   * Send an error to the sender
   * @param {Number} errorId
   */
  const sendError = (errorId) => {
    const errorResp = Buffer.alloc(2);
    errorResp.writeUInt8(commandIds.error);
    errorResp.writeUInt8(errorId);
    client.send(errorResp);
  };

  // Send an error if the command does not exists
  if (!command) return sendError(errors.commandNotFound);

  // Execute the command
  command({
    data,
    server,
    client,
    state: client.state,
    commandId,
    lobby: client.state.lobby,
    sendError,

    /**
       * Send the confirmation to the sender
       */
    sendConfirm: () => {
      const confirm = Buffer.alloc(1);
      confirm.writeUInt8(commandId);
      client.send(confirm);
    },

    /**
         * Broadcast the message to all lobby clients, except the sender one.
         * @param {Buffer} response
         */
    sendBroadcast: (response) => {
      client.lobby.players.forEach(player => client !== player && player.send(response));
    }
  });
};
