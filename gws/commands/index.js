const mapping = {
  65534: 'lobby_list',
  65533: 'lobby_create',
  65532: 'lobby_join',
  65531: 'lobby_leave',
  65530: 'lobby_allow_join',
  65529: 'lobby_kick',
  65528: 'lobby_transfer',
  65527: 'lobby_max_players',
  65526: 'lobby_start_game',
  65525: 'game_message'
}

const commands = {
  lobby_list: require('./lobby_list').handler,
  lobby_create: require('./lobby_create').handler,
  lobby_join: require('./lobby_join').handler,
  lobby_leave: require('./lobby_leave').handler,
  lobby_allow_join: require('./lobby_allow_join').handler,
  lobby_kick: require('./lobby_kick').handler,
  lobby_transfer: require('./lobby_transfer').handler,
  lobby_max_players: require('./lobby_max_players').handler,
  lobby_start_game: require('./lobby_start_game').handler,
  game_message: require('./game_message').handler
}

/** Execute the method based on the payload event ID */
exports.execMethod = (client, data) => {
  commands[mapping[data.readUIntLE(0, 2)]](client, data)
}
