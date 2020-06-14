const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commands');

/**
 * Set the allow join lobby flag
 */
exports.handler = ({ client, state, data, lobby, commandId, sendBroadcast, confirmError }) => {
  // Get the input
  const allowJoin = data.readUInt8(2);

  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return confirmError(errors.unauthorized);

  // Set the flag
  lobby.allowJoin = allowJoin;

  // Confirm the allow join change
  const response = Buffer.alloc(3);
  response.writeUInt8(commandId);
  response.writeUInt8(errors.noError);
  response.writeUInt8(allowJoin);
  client.send(response);

  // Broadcast the allow join to all players
  const broadcastResponse = Buffer.alloc(2);
  broadcastResponse.writeUInt8(commandIds.lobby_allow_join_changed);
  broadcastResponse.writeUInt8(allowJoin);
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
