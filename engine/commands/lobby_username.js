const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');

/**
 * Set the player username
 */
exports.handler = ({ client, state, data, lobby, commandId, sendBroadcast, sendConfirmWithError, udpHeaderSize, appendUdpHeader }) => {
  // Get the input
  const newUsername = data.slice(1, data.indexOf(0, 1));

  // Lobby check
  if (!lobby) return sendConfirmWithError(errors.lobbyNotFound);

  // Set the username
  state.username = newUsername;

  // Send the confirm
  const response = Buffer.allocUnsafe(3 + newUsername.length + udpHeaderSize);
  response[0] = commandId;
  response[1] = errors.noError;
  response.write(newUsername + '\0', 2);
  if (udpHeaderSize) appendUdpHeader(response);
  client.send(response);

  // Broadcast the new name
  const broadcastResponse = Buffer.allocUnsafe(3 + newUsername.length + udpHeaderSize);
  broadcastResponse[0] = commandIds.lobby_player_username;
  broadcastResponse[1] = state.id;
  broadcastResponse.write(newUsername + '\0', 2);
  if (udpHeaderSize) appendUdpHeader(broadcastResponse);
  sendBroadcast(broadcastResponse);
};

/**
interface Input {
  commandId           u8
  newUsername         string
}

interface SenderOutput {
  commandId           u8
  error               u8
  newUsername         string
}

interface BroadcastOutput {
  commandId           u8
  playerId            u8
  newUsername         string
}
*/
