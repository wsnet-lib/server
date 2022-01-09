const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');
const { findLobby } = require('../models/lobby');

/**
 * Auto join a lobby
 */
exports.handler = ({ client, data, state, sendConfirmWithError, udpHeaderSize, createBuffer }) => {
  // Get the input
  const dateSort = data[1];
  const maxPlayersSort = data[2];
  const username = data.slice(3, data.length - 1 - udpHeaderSize);

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
  const senderResponse = createBuffer(size);
  senderResponse.writeU8(commandIds.lobby_join);
  senderResponse.writeU8(errors.noError);
  senderResponse.writeU32(lobby.id);
  senderResponse.writeU8(lobby.adminId);
  senderResponse.writeU8(playerId);
  senderResponse.writeU8(players.length);
  players.forEach(player => {
    senderResponse.writeU8(player.state.id);
    senderResponse.writeString(player.state.username);
  });
  senderResponse.send();

  // Broadcast the message
  const broadcastResponse = createBuffer(3 + username.length);
  broadcastResponse.writeU8(commandIds.lobby_player_joined);
  broadcastResponse.writeU8(playerId);
  broadcastResponse.writeString(username);
  broadcastResponse.broadcast();
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
