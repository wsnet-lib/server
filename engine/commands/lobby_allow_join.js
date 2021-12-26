const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');

/**
 * Set the allow join lobby flag
 */
exports.handler = ({ client, state, data, lobby, commandId, sendBroadcast, sendConfirmWithError, udpHeaderSize, appendUdpHeader }) => {
  // Get the input
  const allowJoin = data[1];

  // Lobby check
  if (!lobby) return sendConfirmWithError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return sendConfirmWithError(errors.unauthorized);

  // Set the flag
  lobby.allowJoin = allowJoin;

  // Confirm the allow join change
  const response = Buffer.allocUnsafe(3);
  response[0] = commandId;
  response[1] = errors.noError;
  response[2] = allowJoin;
  if (udpHeaderSize) appendUdpHeader(response);
  client.send(response);

  // Broadcast the allow join to all players
  const broadcastResponse = Buffer.allocUnsafe(2);
  broadcastResponse[0] = commandIds.lobby_allow_join_changed;
  broadcastResponse[1] = allowJoin;
  if (udpHeaderSize) appendUdpHeader(broadcastResponse);
  sendBroadcast(broadcastResponse);
};

/**
interface Input {
  commandId           u8
  allowJoin           u8
}

interface SenderOutput {
  commandId           u8
  error               u8
  allowJoin           u8
}

interface BroadcastOutput {
  commandId           u8
  allowJoin           u8
}
*/
