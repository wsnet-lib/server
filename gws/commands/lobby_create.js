const bcrypt = require('bcryptjs');
const { createLobby } = require('../models/lobby');

/**
 * Create a lobby
 */
exports.handler = async ({ data, state, client, commandId }) => {
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

  // Get the password and hash it (if specified)
  let password = data.slice(offset, data.length - 1).toString();
  if (password) password = await bcrypt.hash(password, 8);

  // Create the lobby
  const lobby = createLobby(lobbyName, maxPlayers, client, password);

  // Update the client state
  state.id = 0;
  state.username = adminName;
  state.lobby = lobby;

  // Send the response
  const payload = Buffer.alloc(2);
  payload.writeUInt8(commandId);
  payload.writeUInt8(lobby.id);
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
