/** LOBBY INTERFACE
 *
 * {
 *  id: number
 *  name: string
 *  players: Player[]
 *  maxPlayers: number
 * }
 */

/** Lobbies list */
const lobbies = []
let lobbyAutoIncrement = 0

/**
 * Get the lobbies list
 * @return Lobby[]
 */
exports.getLobbies = () => lobbies

/** Create a lobby, if not already in a lobby
 * @param {Number} maxPlayers
 */
exports.createLobby = (lobbyName, maxPlayers, username) => {
  const id = lobbyAutoIncrement++

  lobbies.push({
    id,
    name: lobbyName,
    players: [{ id: 0, username }],
    maxPlayers
  })

  return id
}
