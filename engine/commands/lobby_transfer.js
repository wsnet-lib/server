const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');

/**
 * Transfer the lobby ownership to another player
 */
exports.handler = ({ client, state, data, lobby, commandId, sendBroadcast, sendConfirmWithError, udpHeaderSize, appendUdpHeader }) => {
  // Get the new admin ID
  const newAdminId = data[1];

  // Lobby check
  if (!lobby) return sendConfirmWithError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id || newAdminId === state.id) return sendConfirmWithError(errors.unauthorized);

  // Set the lobby admin
  lobby.adminId = newAdminId;

  // Confirm the new_admin change
  const response = Buffer.allocUnsafe(3 + udpHeaderSize);
  response[0] = commandId;
  response[1] = errors.noError;
  response[2] = newAdminId;
  if (udpHeaderSize) appendUdpHeader(response);
  client.send(response);

  // Broadcast the new admin to all players
  const broadcastResponse = Buffer.allocUnsafe(2 + udpHeaderSize);
  broadcastResponse[0] = commandIds.lobby_transfer_changed;
  broadcastResponse[1] = newAdminId;
  if (udpHeaderSize) appendUdpHeader(broadcastResponse);
  sendBroadcast(broadcastResponse);
};

/**
interface Input {
  commandId           u8
  newAdminId          u8
}

interface SenderOutput {
  commandId           u8
  error               u8
  newAdminId          u8
}

interface BroadcastOutput {
  commandId           u8
  newAdminId          u8
}
*/
