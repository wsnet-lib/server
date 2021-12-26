const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');
const { findLobby } = require('../models/lobby');

/**
 * Auto join a lobby
 */
exports.handler = ({ client, data, state, sendBroadcast, sendConfirmWithError, udpHeaderSize, appendUdpHeader }) => {
  // Get the input
  const dateSort = data[1];
  const maxPlayersSort = data[2];
  const username = data.slice(3, data.length - 1);

  // Get the first available lobby
  if (state.lobby) return sendConfirmWithError(errors.alreadyInLobby, commandIds.lobby_join);
  const lobby = findLobby(dateSort, maxPlayersSort, state.ip);
  if (!lobby) return sendConfirmWithError(errors.lobbyNotFound, commandIds.lobby_join);
  const { players, freeIds } = lobby;

  // Add the player to the lobby
  const playerId = freeIds.shift();
  state.id = playerId;
  state.lobby = lobby;
  state.username = username;
  players.push(client);

  // Build the sender response
  const size = 9 + players.reduce((size, player) => (size + player.state.username.length + 2), 0);
  const senderResponse = Buffer.allocUnsafe(size + udpHeaderSize);
  senderResponse[0] = commandIds.lobby_join;
  senderResponse[1] = errors.noError;
  senderResponse.writeUInt32LE(lobby.id, 2);
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
  dateSort            u8
  maxPlayersSort      u8
  username            string
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
  commandId           u8
  playerId            u8
  playerName          string
*/
