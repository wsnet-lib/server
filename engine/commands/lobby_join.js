const crypto = require('crypto');
const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');
const { lobbies } = require('../models/lobby');

/**
 * Join a lobby
 */
exports.handler = ({
  client, data, state, commandId, sendBroadcast, sendConfirmWithError, udpHeaderSize, appendUdpHeader
}) => {
  // Get the input
  const nullCharIndex = data.indexOf(0, 1);
  const username = data.slice(1, nullCharIndex).toString();
  const lobbyId = data.readUInt32LE(nullCharIndex + 1);
  const inputLobbyPassword = data.slice(nullCharIndex + 5, data.length - 1).toString();

  // Lobby check
  if (state.lobby) return sendConfirmWithError(errors.alreadyInLobby);
  const lobby = lobbies[lobbyId];
  if (!lobby) return sendConfirmWithError(errors.lobbyNotFound);
  const { password: lobbyPassword, players, maxPlayers, freeIds, isBanned } = lobby;

  // Bans/join
  if (!lobby.allowJoin || isBanned(state.ip)) return sendConfirmWithError(errors.unauthorized);

  // Max players check
  if (players.length >= maxPlayers) {
    return sendConfirmWithError(errors.maxLobbyPlayers);
  }

  // Password check, if needed
  if (lobbyPassword) {
    const hashedInputPsw = crypto.createHash('sha1').update(inputLobbyPassword).digest();
    if (!crypto.timingSafeEqual(hashedInputPsw, lobbyPassword)) {
      return sendConfirmWithError(errors.wrongPassword);
    }
  }

  // Add the player to the lobby
  const playerId = freeIds.shift();
  state.id = playerId;
  state.lobby = lobby;
  state.username = username;
  players.push(client);

  // Build the sender response
  const size = 9 + players.reduce((size, player) => (size + player.state.username.length + 2), 0);
  const senderResponse = Buffer.allocUnsafe(size + udpHeaderSize);
  senderResponse[0] = commandId;
  senderResponse[1] = errors.noError;
  senderResponse.writeUInt32LE(lobbyId, 2);
  senderResponse[6] = lobby.adminId;
  senderResponse[7] = playerId;
  senderResponse[8] = players.length;
  let offset = 9;
  players.forEach(player => {
    senderResponse[offset++] = player.state.id;
    senderResponse.write(player.state.username + '\0', offset);
    offset += player.state.username.length + 1;
  });

  if (udpHeaderSize) appendUdpHeader(senderResponse);
  client.send(senderResponse);

  // Broadcast the message
  const broadcastResponse = Buffer.allocUnsafe(3 + username.length + udpHeaderSize);
  broadcastResponse[0] = commandIds.lobby_player_joined;
  broadcastResponse[1] = playerId;
  broadcastResponse.write(username + '\0', 2);
  if (udpHeaderSize) appendUdpHeader(broadcastResponse);
  sendBroadcast(broadcastResponse);
};

/**
interface Input {
  commandId           u8
  username            string
  lobbyId             u32
  lobbyPassword?      string
}

interface SenderOutput {
  commandId           u8
  error               u8
  lobbyId             u32
  adminId             u8
  playerId            u8
  playersCount        u8
  [
    playerId          u8
    playerName        string
  ]
}

interface BroadcastOutput {
  lobby_player_joined u8
  playerId            u8
  playerName          string
*/
