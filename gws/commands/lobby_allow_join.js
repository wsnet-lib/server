const { errors } = require('../lib/errors');

/**
 * Set the allow join lobby flag
 */
exports.handler = ({ client, state, data, lobby, commandId, sendBroadcast, sendError }) => {
  // Get the input
  const allowJoin = data.readUInt8(2);

  // Lobby check
  if (!lobby) return sendError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return sendError(errors.unauthorized);

  // Set the flag
  lobby.allowJoin = allowJoin;

  // Broadcast the allow join to all players
  const response = Buffer.alloc(2);
  response.writeUInt8(commandId);
  response.writeUInt8(allowJoin);
  sendBroadcast(response);
};

/**
interface Input {
  commandId           u8
  allowJoin           u8
}

interface Output {
  commandId           u8
}
*/
