const crypto = require('crypto');
const { errors } = require('../lib/errors');
const { createLobby } = require('../models/lobby');

/**
 * Create a lobby
 */
exports.handler = ({ data, state, lobby, client, commandId, sendConfirmWithError, udpHeaderSize, createBuffer }) => {
  if (lobby) return sendConfirmWithError(errors.alreadyInLobby);

  // Get the lobby name
  let nullCharIndex = data.indexOf(0, 1);
  const lobbyName = data.slice(1, nullCharIndex).toString();
  let offset = nullCharIndex + 1;

  // Get the max players
  const maxPlayers = data[offset++];

  // Get the admin name
  nullCharIndex = data.indexOf(0, offset);
  const adminName = data.slice(offset, nullCharIndex).toString();
  offset = nullCharIndex + 1;

  // Get the password and hash it (if specified)
  let password = data.slice(offset, data.length - 1 - udpHeaderSize).toString() || null;
  if (password) password = crypto.createHash('sha1').update(password).digest();

  // Create the lobby
  const createdLobby = createLobby(lobbyName, maxPlayers, client, password);

  // Update the client state
  state.id = 0;
  state.username = adminName;
  state.lobby = createdLobby;

  // Send the response
  const payload = createBuffer(7 + adminName.length);
  payload.writeU8(commandId);
  payload.writeU8(errors.noError);
  payload.writeU32(createdLobby.id);
  payload.writeString(adminName);
  payload.send();
};

/**
interface Input {
  lobbyName       string
  maxPlayers      u8
  adminName       string
  password?       string
}

interface Output {
  commandId       u8
  error           u8
  lobbyId         u32
  playerName      string
*/
