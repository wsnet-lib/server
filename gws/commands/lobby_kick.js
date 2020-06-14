const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');

/**
 * Kick or ban a player
 */
exports.handler = ({ client, state, data, lobby, commandId, sendBroadcast, confirmError }) => {
  // Get the input
  const kickedPlayerId = data.readUInt8(1);
  const kickOrBan = data.readUInt8(1);

  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return confirmError(errors.unauthorized);

  // Find the player
  const { players } = lobby;

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (player.state.id !== kickedPlayerId) {
      // Kick the player
      lobby.players.splice(i, 1);
      lobby.freeIds.push(kickedPlayerId);

      // Add a ban for this player if specified
      if (kickOrBan) lobby.bans[player.state.ip] = true;
      break;
    }
  }

  // Confirm the player kick/ban
  const response = Buffer.alloc(4);
  response.writeUInt8(commandId);
  response.writeUInt8(errors.noError, 1);
  response.writeUInt8(kickedPlayerId, 2);
  response.writeUInt8(kickOrBan, 3);
  client.send(response);

  // Broadcast the kicked player to other lobby players
  const broadcastResponse = Buffer.alloc(3);
  broadcastResponse.writeUInt8(commandIds.lobby_player_kicked);
  broadcastResponse.writeUInt8(kickedPlayerId, 1);
  broadcastResponse.writeUInt8(kickOrBan, 2);
  sendBroadcast(broadcastResponse);
};

/**
interface Input {
  commandId           u8
  playerId            u8
  kickOrBan           u8
}

interface ResponseOutput {
  commandId           u8
  error               u8
  playerId            u8
  kickOrBan           u8
}

interface BroadcastOutput {
  commandId           u8
  playerId            u8
  kickOrBan           u8
}
*/
