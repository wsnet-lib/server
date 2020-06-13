/**
 * interface Lobby {
 *  id: number
 *  name: string
 *  players: Player[]
 *  maxPlayers: number
 *  password?: string
 * }
 */

/** Lobby list */
const lobbies = [];

/** Lobby Increment ID */
let lobbyAutoIncrement = 0;

/**
 * Get the lobbies list
 * @return Lobby[]
 */
exports.getLobbies = () => lobbies;

/**
 * Create a lobby, if not already in a lobby
 *
 * @param {String} lobbyName
 * @param {Number} maxPlayers
 * @param {String} username
 * @param {String} password
 *
 * @return {Number} Lobby ID
 */
exports.createLobby = (lobbyName, maxPlayers, username, password) => {
  const id = lobbyAutoIncrement++;

  lobbies.push({
    id,
    name: lobbyName,
    players: [{ id: 0, username }],
    maxPlayers,
    password
  });

  return id;
};
