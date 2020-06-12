
const commandIds = {
  'lobby_list': 0,
  'lobby_create': 1,
  'lobby_join': 2,
  'lobby_leave': 3,
  'lobby_allow_join': 4,
  'lobby_kick': 5,
  'lobby_transfer': 6,
  'lobby_max_players': 7,
  'lobby_start_game': 8,
  'game_message': 9
}

const commands = [
  require('./lobby_list').handler,
  require('./lobby_create').handler,
  require('./lobby_join').handler,
  require('./lobby_leave').handler,
  require('./lobby_allow_join').handler,
  require('./lobby_kick').handler,
  require('./lobby_transfer').handler,
  require('./lobby_max_players').handler,
  require('./lobby_start_game').handler,
  require('./game_message').handler
]

/** Command id **/
exports.commandIds = commandIds;

/** Execute the method based on the payload event ID */
exports.execMethod = (client, data) => {
  commands[data.readUInt8(0)](client, data)
}
