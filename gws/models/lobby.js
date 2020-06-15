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

// Cached functions
const hasProp = Object.prototype.hasOwnProperty.bind(Object);
const sortByAllAsc = (a, b) => a.createdAt - b.createdAt || a.players.length - b.players.length;
const sortByAllDesc = (a, b) => b.createdAt - a.createdAt || b.players.length - a.players.length;

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
  return lobbiesArray.find(lobby => lobby.players.length < lobby.maxPlayers && !lobby.password && !hasProp(lobby.bans, playerIp));
};
