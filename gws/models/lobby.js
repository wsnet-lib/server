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
  for (let i = 254; i > 0; i--) freeIds[i] = i;

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
    bans: {}
  };
  lobbies[id] = lobby;
  return lobby;
};
