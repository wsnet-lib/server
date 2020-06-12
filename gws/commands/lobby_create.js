const { createLobby } = require('../lobbies')

/**
 * @param {WebSocket} client
 * @param {Buffer} data
 */
exports.handler = (client, data) => {
  // Get the lobby name
  const nullCharIndex = data.indexOf(0)
  const lobbyName = data.slice(2, nullCharIndex).toString()

  // Get the max players
  const maxPlayers = data.readUInt8(nullCharIndex + 1)

  // Get the admin name
  const adminName = data.slice(nullCharIndex + 2, data.length - 1).toString()

  // Create the lobby
  const lobbyId = createLobby(lobbyName, maxPlayers, adminName)

  // Send the response
  const payload = Buffer.alloc(1)
  payload.writeUInt8(lobbyId)
  client.send(payload)
}
