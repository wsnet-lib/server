const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commands');

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
  
  // confirm the player kick/ban 
  const response = Buffer.alloc(4); 
  response.writeUInt8(commandId); 
  response.writeUInt8(errors.noError);
  response.writeUInt8(kickedPlayerId);
  response.writeUInt8(kickOrBan);
  client.send(response);

  // Broadcast the kicked player to other lobby players
  const response = Buffer.alloc(3); 
  response.writeUInt8(commandIds.lobby_player_kicked);
  response.writeUInt8(kickedPlayerId);
  response.writeUInt8(kickOrBan);
  sendBroadcast(response);
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
