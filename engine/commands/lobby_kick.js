const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');
const { resetLobbyState } = require('../models/player');

/**
 * Kick or ban a player
 */
exports.handler = ({ client, state, data, lobby, commandId, sendBroadcast, sendConfirmWithError, udpHeaderSize, appendUdpHeader }) => {
  // Get the input
  const kickedPlayerId = data[1];
  const kickOrBan = data[2];

  // Lobby check
  if (!lobby) return sendConfirmWithError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return sendConfirmWithError(errors.unauthorized);

  // Player check
  if (kickedPlayerId === state.id) return sendConfirmWithError(errors.unauthorized);

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

  if (!foundPlayer) return sendConfirmWithError(errors.playerNotFound);

  // Confirm the player kick/ban
  const response = Buffer.allocUnsafe(4 + udpHeaderSize);
  response[0] = commandId;
  response[1] = errors.noError;
  response[2] = kickedPlayerId;
  response[3] = kickOrBan;
  if (udpHeaderSize) appendUdpHeader(response);
  client.send(response);

  // Broadcast the kicked player to other lobby players
  const broadcastResponse = Buffer.allocUnsafe(3 + udpHeaderSize);
  broadcastResponse[0] = commandIds.lobby_player_kicked;
  broadcastResponse[1] = kickedPlayerId;
  broadcastResponse[2] = kickOrBan;
  if (udpHeaderSize) appendUdpHeader(broadcastResponse);
  sendBroadcast(broadcastResponse);

  // Add a ban for this player if specified
  if (kickOrBan) {
    lobby.bansByIp[foundPlayer.state.ip] = foundPlayer.state.username;
  }

  // Kick the player
  resetLobbyState(foundPlayer.state);
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
