const { errors } = require('../lib/errors');

/**
 * Kick or ban a player
 */
exports.handler = ({ client, state, data, lobby, commandId, sendBroadcast, sendError }) => {
  // Get the input
  const kickedPlayerId = data.readUInt8(1);
  const kickOrBan = data.readUInt8(1);

  // Lobby check
  if (!lobby) return sendError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return sendError(errors.unauthorized);

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

  // Broadcast the kicked player to all lobby players
  const response = Buffer.alloc(2);
  response.writeUInt8(commandId);
  response.writeUInt8(kickedPlayerId);
  response.writeUInt8(kickOrBan);
  sendBroadcast(response);

  // Send the confirmation
  const confirm = Buffer.alloc(1);
  confirm.writeUInt8(commandId);
  client.send(confirm);
};

/**
interface Input {
  commandId           u8
  playerId            u8
  kickOrBan           u8
}

interface KickOutput {
  commandId           u8
  playerId            u8
  kickOrBan           u8
}
*/
