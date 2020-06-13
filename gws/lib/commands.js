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
  lobby_start_game: 8,
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

  // Send an error if the command does not exists
  if (!command) {
    const payload = Buffer.alloc(3);
    payload.writeUInt8(commandIds.error);
    payload.writeUInt16LE(errors.commandNotFound);
    return client.send(payload);
  }

  // Execute the command
  command(
    /** @type {Request} */
    {
      data,
      server,
      client,
      state: client.state,
      commandId,
      lobby: client.state.lobby
    },

    /** @type {Response} */
    {
      send: client.send.bind(client),

      /**
       * Send an error to the sender
       * @param {Number} errorId
       */
      sendError: (errorId) => {
        const errorResp = Buffer.alloc(3);
        errorResp.writeUInt8(commandIds.error);
        errorResp.writeUInt16LE(errorId);
        client.send(errorResp);
      }
    }
  );
};
