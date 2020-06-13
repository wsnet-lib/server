const { commandIds } = require('../commandIds');
const { createLobby } = require('../lobbies');

/**
 * Create a lobby
 * @param {WebSocket} client
 * @param {Buffer} data
 */
exports.handler = (client, data) => {
  // Get the lobby name
  let nullCharIndex = data.indexOf(0);
  const lobbyName = data.slice(1, nullCharIndex).toString();
  let offset = nullCharIndex + 1;

  // Get the max players
  const maxPlayers = data.readUInt8(offset++);

  // Get the admin name
  nullCharIndex = data.indexOf(0, offset);
  const adminName = data.slice(offset, nullCharIndex).toString();
  offset = nullCharIndex + 1;

  // Get the password (if specified)
  const password = data.slice(offset, data.length - 1).toString();

  // Create the lobby
  const lobbyId = createLobby(lobbyName, maxPlayers, adminName, password);

  // Send the response
  const payload = Buffer.alloc(2);
  payload.writeUInt8(commandIds.lobby_create);
  payload.writeUInt8(lobbyId);
  client.send(payload);
};

/**
interface Input {
  lobbyName       string
  maxPlayer       u8
  adminName       string
  password?       string
}

interface Output {
  commandId       u8
  lobbyId         u8
*/
