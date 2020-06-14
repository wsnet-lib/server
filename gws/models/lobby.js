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
 *  bans: Object<Bans>
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
    bans: {},
    createdAt: new Date()
  };
  lobbies[id] = lobby;
  return lobby;
};

// Cached sorting functions
const sortByDate = (a, b) => b.createdAt - a.createdAt;
const sortByMaxPlayers = (a, b) => b.players.length - a.players.length;
const sortByAll = (a, b) => b.createdAt - a.createdAt || b.players.length - a.players.length;

/**
   * Find a lobby based on the sort criteria
   *
   * @param {Boolean} dateSort (0=disabled, 1=enabled)
   * @param {Boolean} maxPlayersSort (0=disabled, 1=enabled)
   *
   * @return {Lobby}
   */
exports.findLobby = (dateSort, maxPlayersSort) => {
  // Get the sorting method
  let sortMethod;
  if (!dateSort && !maxPlayersSort) {
    sortMethod = undefined;
  } else if (dateSort && !maxPlayersSort) {
    sortMethod = sortByDate;
  } else if (!dateSort && maxPlayersSort) {
    sortMethod = sortByMaxPlayers;
  } else {
    sortMethod = sortByAll;
  }

  // Sort the lobbies
  const sortedLobbies = Object.values(lobbies).sort(sortMethod);

  // Get the first lobby not full and without a password
  return sortedLobbies.find(lobby => lobby.players.length < lobby.maxPlayers && !lobby.password);
};
