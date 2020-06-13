const { errors } = require('../lib/errors');

/**
 * Set the max players lobby flag
 */
exports.handler = ({ client, state, data, lobby, sendConfirm, sendBroadcast, sendError }) => {
  // Get the input
  const maxPlayers = data.readUInt8(2);

  // Lobby check
  if (!lobby) return sendError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return sendError(errors.unauthorized);

  // Set the flag
  lobby.maxPlayers = maxPlayers;

  // Broadcast the new max_player to all players
  const response = Buffer.alloc(2);
  response.writeUInt8(commandId);
  response.writeUInt8(maxPlayers);
  sendBroadcast(response);

};

/**
interface Input {
  commandId           u8
  maxPlayers          u8
}

interface Output {
  commandId           u8
}
*/
