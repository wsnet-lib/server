const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');

/**
 * Kick or ban a player
 */
exports.handler = ({ client, state, data, lobby, commandId, sendBroadcast, confirmError }) => {
  // Get the input
  const kickedPlayerId = data[1];
  const kickOrBan = data[2];

  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return confirmError(errors.unauthorized);

  // Find the player
  const { players } = lobby;
  let foundPlayer;
  let foundPlayerIdx;

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (player.state.id !== kickedPlayerId) continue;
    foundPlayer = player;
    foundPlayerIdx = i;
    break;
  }

  if (!foundPlayer) return confirmError(errors.playerNotFound);

  // Confirm the player kick/ban
  const response = Buffer.alloc(4);
  response[0] = commandId;
  response[1] = errors.noError;
  response[2] = kickedPlayerId;
  response[3] = kickOrBan;
  client.send(response);

  // Broadcast the kicked player to other lobby players
  const broadcastResponse = Buffer.alloc(3);
  broadcastResponse[0] = commandIds.lobby_player_kicked;
  broadcastResponse[1] = kickedPlayerId;
  broadcastResponse[2] = kickOrBan;
  sendBroadcast(broadcastResponse);

  // Add a ban for this player if specified
  if (kickOrBan) lobby.bans[state.ip] = true;

  // Kick the player
  delete foundPlayer.state.id;
  delete foundPlayer.state.lobby;
  delete foundPlayer.state.username;
  lobby.players.splice(foundPlayerIdx, 1);
  lobby.freeIds.push(kickedPlayerId);
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
