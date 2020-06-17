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
  null, // OutputCommand: lobby_transfer_changed
  require('./lobby_allow_join').handler,
  null, // OutputCommand: lobby_allow_join_changed
  require('./lobby_max_players').handler,
  null, // OutputCommand: lobby_max_players_changed
  require('./lobby_kick').handler,
  null, // OutputCommand: lobby_player_kicked,
  null, // require('./lobby_password').handler,
  null, // require('./lobby_username').handler,
  null, // OutputCommand: lobby_player_username,
  require('./lobby_bans').handler,
  require('./lobby_unban').handler
];

/** Command handlers */
exports.commandHandlers = commandHandlers;
