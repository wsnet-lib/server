const { errors } = require('../lib/errors');
const { unbanPlayer } = require('../models/lobby');

/**
 * Unban a player
 */
exports.handler = ({ lobby, data, state, commandId, confirmError, client }) => {
  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return confirmError(errors.unauthorized);

  // Get the input
  const ipHash = data.slice(1, data.indexOf(0, 1));

  // Player check
  if (!lobby.bansByIp[ipHash]) return confirmError(errors.playerNotFound);

  // Unban the player
  unbanPlayer(lobby, state.ip);

  // Send the confirmation to the sender
  const response = Buffer.alloc(3 + ipHash.length);
  response[0] = commandId;
  response[1] = errors.noError;
  response.write(ipHash + '\0', 2);
  client.send(response);
};

/**
interface Input {
  commandId           u8
  ipHash              string
}

interface SenderOutput {
  commandId           u8
  error               u8
  ipHash              string
}
*/
