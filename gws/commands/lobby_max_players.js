const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commands');

/**
 * Set the max players lobby flag
 */
exports.handler = ({ client, state, data, commandId, lobby, sendBroadcast, confirmError }) => {
  // Get the input
  const maxPlayers = data.readUInt8(2);

  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return confirmError(errors.unauthorized);

  // Set the flag
  lobby.maxPlayers = maxPlayers;

  // Confirm the max_player change
  const response = Buffer.alloc(3);
  response.writeUInt8(commandId);
  response.writeUInt8(errors.noError);
  response.writeUInt8(maxPlayers);
  client.send(response);

  // Broadcast the new max_player to all players
  const broadcastResponse = Buffer.alloc(2);
  broadcastResponse.writeUInt8(commandIds.lobby_max_players_changed);
  broadcastResponse.writeUInt8(maxPlayers);
  sendBroadcast(broadcastResponse);
};

/**
interface Input {
  commandId           u8
  maxPlayers          u8
}

interface SenderOutput {
  commandId           u8
  error               u8
  maxPlayers          u8
}

interface BroadcastOutput {
  commandId           u8
  maxPlayers          u8
}
*/
