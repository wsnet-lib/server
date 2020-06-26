/**
interface Player {
  ip: String
  id: Number
  username: String
  data: PlayerData
  lobby: Lobby
  lobbyData: PlayerLobbyData
  connectedAt: Date
}
*/

/** Global players state */
const players = (exports.players = {});

/**
 * Get the player based on the IP hash or create a new one
 * @param {String} ip
 */
exports.getPlayer = (ip, autoReconnectPlayers) => {
  // When the reconnect feature is disabled, always return a new local state
  if (!autoReconnectPlayers) return { ip, connectedAt: new Date() };

  // Get the player state based on its IP
  let player = players[ip];
  if (!player) {
    player = { ip };
    players[ip] = player;
  }
  player.connectedAt = new Date();
  return player;
};

/**
 * Reset the player lobby state
 * @param {State} state
 */
exports.resetLobbyState = (state) => {
  delete state.id;
  delete state.lobby;
  delete state.username;
  state.lobbyData = {};
};

/**
 * Reset the player global state
 * @param {State} state
 */
exports.resetState = (state) => {
  exports.resetLobbyState(state);
  state.data = {};
};
