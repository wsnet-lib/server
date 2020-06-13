const { errors } = require('../errors');
const { commandIds } = require('../commandIds');

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
