const commandHandlers = [
  null, // OutputCommand: error
  require('./game_message').handler,
  require('./lobby_list').handler,
  require('./lobby_create').handler,
  require('./lobby_join').handler,
  require('./lobby_join_auto').handler,
  null, // OutputCommand: lobby_player_joined
  require('./lobby_leave').handler,
  null, // OutputCommand: lobby_player_left
  require('./lobby_transfer').handler,
  require('./lobby_allow_join').handler,
  require('./lobby_max_players').handler,
  require('./lobby_kick').handler
];

/** Command handlers */
exports.commandHandlers = commandHandlers;
