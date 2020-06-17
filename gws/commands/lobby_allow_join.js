const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');

/**
 * Set the allow join lobby flag
 */
exports.handler = ({ client, state, data, lobby, commandId, sendBroadcast, confirmError }) => {
  // Get the input
  const allowJoin = data.readUInt8(1);

  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return confirmError(errors.unauthorized);

  // Set the flag
  lobby.allowJoin = allowJoin;

  // Confirm the allow join change
  const response = Buffer.alloc(3);
  response[0] = commandId;
  response[1] = errors.noError;
  response[2] = allowJoin;
  client.send(response);

  // Broadcast the allow join to all players
  const broadcastResponse = Buffer.alloc(2);
  broadcastResponse[0] = commandIds.lobby_allow_join_changed;
  broadcastResponse[1] = allowJoin;
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
