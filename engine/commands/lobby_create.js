const crypto = require('crypto');
const { errors } = require('../lib/errors');
const { createLobby } = require('../models/lobby');

/**
 * Create a lobby
 */
exports.handler = ({ data, state, lobby, client, commandId, sendConfirmWithError, udpHeaderSize, appendUdpHeader }) => {
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
  let password = data.slice(offset, data.length - 1).toString() || null;
  if (password) password = crypto.createHash('sha1').update(password).digest();

  // Create the lobby
  const createdLobby = createLobby(lobbyName, maxPlayers, client, password);

  // Update the client state
  state.id = 0;
  state.username = adminName;
  state.lobby = createdLobby;

  // Send the response
  const payload = Buffer.allocUnsafe(7 + adminName.length + udpHeaderSize);
  payload[0] = commandId;
  payload[1] = errors.noError;
  payload.writeUInt32LE(createdLobby.id, 2);
  payload.write(adminName + '\0', 6);
  if (udpHeaderSize) appendUdpHeader(payload);

  client.send(payload);
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
