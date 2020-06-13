const { errors } = require('../errors');

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

const commandHandlers = [
  require('./lobby_list').handler,
  require('./lobby_create').handler,
  require('./lobby_join').handler,
  require('./lobby_leave').handler,
  require('./lobby_allow_join').handler,
  require('./lobby_kick').handler,
  require('./lobby_transfer').handler,
  require('./lobby_max_players').handler,
  require('./lobby_start_game').handler,
  require('./game_message').handler,
  null, // Errors
  require('./lobby_join_auto').handler
];

/** Command IDs */
exports.commandIds = commandIds;

/** Command handlers */
exports.commandHandlers = commandHandlers;

/** Execute the command based on the payload event ID */
exports.execCommand = (client, data) => {
  const command = commandHandlers[data.readUInt8(0)];

  // Send an error if the command does not exists
  if (!command) {
    const payload = Buffer.alloc(3);
    payload.writeUInt8(commandIds.error);
    payload.writeUInt16LE(errors.commandNotFound);
    return client.send(payload);
  }

  // Execute the command
  command(client, data);
};
