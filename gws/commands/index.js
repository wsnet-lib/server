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
