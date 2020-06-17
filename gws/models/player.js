/**
interface Player {
  ip: String
  id: Number
  username: String
  data: PlayerData
  lobby: Lobby
  lobbyData: PlayerLobbyData
}
*/

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
