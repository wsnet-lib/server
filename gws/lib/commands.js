const { errors } = require('./errors');
const { commandHandlers } = require('../commands');

const commandIds = {
  error: 0,
  game_message: 1,
  lobby_list: 2,
  lobby_create: 3,
  lobby_join: 4,
  lobby_join_auto: 5,
  lobby_player_joined: 6,
  lobby_leave: 7,
  lobby_player_left: 8,
  lobby_transfer: 9,
  lobby_transfer_changed: 10,
  lobby_allow_join: 11,
  lobby_allow_join_changed: 12,
  lobby_max_players: 13,
  lobby_max_players_changed: 14,
  lobby_kick: 15,
  lobby_player_kicked: 16
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
   * Send an error to the sender using the error commandId
   * @param {Number} errorId
   */
  const sendError = (errorId) => {
    const errorResp = Buffer.alloc(2);
    errorResp.writeUInt8(commandIds.error);
    errorResp.writeUInt8(errorId);
    client.send(errorResp);
  };

   /**
   * Send an error to the sender using the incoming commandId
   * @param {Number} errorId
   */
  const confirmError = (errorId) => {
    const errorResp = Buffer.alloc(2);
    errorResp.writeUInt8(commandId);
    errorResp.writeUInt8(errorId);
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
      confirm.writeUInt8(commandId);
      confirm.writeUInt8(errors.noError);
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
