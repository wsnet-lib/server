const { commandIds } = require('./index')
const { getLobbies } = require('../lobbies')

/**
 * @param {WebSocket} client
 */
exports.handler = (client) => {
  // Get the lobbies
  const lobbies = getLobbies()

  // Calculate the payload size
  const size = lobbies.reduce((size, lobby) => (size + lobby.name.length + 7), 0)

  // Write the response buffer
  const payload = Buffer.alloc(1 + size)
  let offset = 0

  payload.writeUInt8(commandIds.lobby_list, offset++)

  lobbies.forEach(lobby => {
    payload.writeUInt32LE(lobby.id, offset)
    offset += 4

    payload.write(lobby.name + '\0');
    offset += lobby.name.length + 1

    payload.writeUInt8(lobby.players.length, offset++)

    payload.writeUInt8(lobby.maxPlayers, offset++)
  })

  // payload.forEach(byte => console.log(byte)) // log

  // Send the response
  client.send(payload)
}

/**
interface Response {
  commandId       u8
  id              u32
  name            string
  playersCount    u8
  maxPlayers      u8
*/
