const { commandIds } = require('../lib/commandIds');
const { resetLobbyState } = require('./player');

/**
 * interface Lobby {
 *  id: Number
 *  name: String
 *  adminId: Number
 *  freeIds: Number[]
 *  players: Player[]
 *  maxPlayers: Number
 *  password?: String
 *  allowJoin: Boolean
 *  data: LobbyData
 *  bansIp: Object<Bans>
 *  bansUsername: Object<Bans>
 *  isBanned: (state: State): Boolean => {}
 * }
 */

/** Lobby list */
const lobbies = {};

/** Lobby Increment ID */
let lobbyAutoIncrement = 0;

/**
 * Get the lobbies list
 * @return Lobby[]
 */
exports.getLobbies = () => lobbies;

/**
 * Get a lobby
 * @param {Number} id
 * @return Lobby
 */
exports.getLobby = (id) => lobbies[id];

/**
 * Delete a lobby
 * @param {Number} id
 */
exports.deleteLobby = (id) => {
  delete lobbies[id];
};

/**
 * Create a lobby, if not already in a lobby
 *
 * @param {String} lobbyName
 * @param {Number} maxPlayers
 * @param {WebSocket.Client} client
 * @param {String} password
 *
 * @return {Number} Lobby
 */
exports.createLobby = (lobbyName, maxPlayers, client, password) => {
  const id = lobbyAutoIncrement++;

  // Create the available IDs
  const freeIds = [];
  for (let i = 254; i >= 0; i--) freeIds[i] = i;
  freeIds.shift();

  /**
   * Check if a player has been banned
   * @param {State} state Player state
   * @return {Boolean}
   */
  function isBanned(state) {
    return this.bansIp[state.ip] || this.bansUsername[state.username];
  }

  // Push the lobby
  const lobby = {
    id,
    name: lobbyName,
    players: [client],
    adminId: 0,
    freeIds,
    maxPlayers,
    password,
    allowJoin: true,
    createdAt: new Date(),
    data: {},
    bansIp: {},
    bansUsername: {},
    isBanned
  };
  lobbies[id] = lobby;
  return lobby;
};

/**
   * Find a lobby based on the sort criteria
   *
   * @param {Boolean} dateSort (0=disabled, 1=asc, 2=desc)
   * @param {Boolean} maxPlayersSort (0=disabled, 1=asc, 2=desc)
   * @param {String} playerIp
   *
   * @return {Lobby}
   */
exports.findLobby = (dateSort, maxPlayersSort, playerIp) => {
  let lobbiesArray = Object.values(lobbies);

  // Sort the lobbies, if specified
  if (dateSort || maxPlayersSort) {
    lobbiesArray = lobbiesArray.sort((a, b) => {
      const compareDate = dateSort === 1
        ? a.createdAt - b.createdAt
        : b.createdAt - a.createdAt;

      const compareMaxPlayers = maxPlayersSort === 1
        ? a.players.length - b.players.length
        : b.players.length - a.players.length;

      if (dateSort !== 0) {
        return maxPlayersSort === 0 ? compareDate : (compareDate || compareMaxPlayers);
      } else if (maxPlayersSort !== 0) {
        return dateSort === 0 ? compareMaxPlayers : (compareDate || compareMaxPlayers);
      }
    });
  }

  // Get the first lobby not fully and without a password
  return lobbiesArray.find(
    lobby => lobby.players.length < lobby.maxPlayers && !lobby.password && !lobby.isBanned(playerIp) && lobby.allowJoin
  );
};

/**
 * Handle the player disconnection
 * @param {Player.State} state
 * @return {Boolean}
 */
exports.removePlayer = (state) => {
  const { lobby, id: playerId } = state;
  const { players } = lobby;
  const playerLobbyIdx = players.findIndex(player => player.state.id === playerId);
  if (playerLobbyIdx === -1) return false;

  // Remove the player from the lobby
  players.splice(playerLobbyIdx, 1);
  lobby.freeIds.push(playerId);

  let deletedLobby = false;

  // If this user was an admin, assign the admin to another player if any, or delete the lobby
  if (players.length) {
    if (lobby.adminId === playerId) {
      lobby.adminId = players[0].state.id;
    }
  } else {
    exports.deleteLobby(lobby.id);
    deletedLobby = true;
  }

  // Broadcast the removed player to all the other lobby players
  if (!deletedLobby) {
    const response = Buffer.alloc(3);
    response[0] = commandIds.lobby_player_left;
    response[1] = playerId;
    response[2] = lobby.adminId;

    for (let i = 0, len = players.length; i < len; i++) {
      players[i].send(response);
    }
  }

  // Reset the player state
  resetLobbyState(state);
  return true;
};
