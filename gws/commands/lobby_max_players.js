const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');

/**
 * Set the max players lobby flag
 */
exports.handler = ({ client, state, data, commandId, lobby, sendBroadcast, confirmError }) => {
  // Get the input
  const maxPlayers = data[1];

  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return confirmError(errors.unauthorized);

  // Set the flag
  lobby.maxPlayers = maxPlayers;

  // Confirm the max_player change
  const response = Buffer.alloc(3);
  response[0] = commandId;
  response[1] = errors.noError;
  response[2] = maxPlayers;
  client.send(response);

  // Broadcast the new max_player to all players
  const broadcastResponse = Buffer.alloc(2);
  broadcastResponse[0] = commandIds.lobby_max_players_changed;
  broadcastResponse[1] = maxPlayers;
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
