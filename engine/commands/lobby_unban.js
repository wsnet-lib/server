const { errors } = require('../lib/errors');
const { unbanPlayer } = require('../models/lobby');

/**
 * Unban a player
 */
exports.handler = ({ lobby, data, state, commandId, sendConfirmWithError, client, udpHeaderSize, appendUdpHeader }) => {
  // Lobby check
  if (!lobby) return sendConfirmWithError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return sendConfirmWithError(errors.unauthorized);

  // Get the input
  const ipHash = data.slice(1, data.indexOf(0, 1)).toString();

  // Player check
  if (ipHash === state.ip) return sendConfirmWithError(errors.unauthorized);
  if (!lobby.bansByIp[ipHash]) return sendConfirmWithError(errors.playerNotFound);

  // Unban the player
  unbanPlayer(lobby, state.ip);

  // Send the confirmation to the sender
  const response = Buffer.allocUnsafe(3 + ipHash.length + udpHeaderSize);
  response[0] = commandId;
  response[1] = errors.noError;
  response.write(ipHash + '\0', 2);
  if (udpHeaderSize) appendUdpHeader(response);
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
