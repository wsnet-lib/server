const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');
const { findLobby } = require('../models/lobby');

/**
 * Auto join a lobby
 */
exports.handler = async ({ client, data, state, commandId, sendBroadcast, confirmError }) => {
  // Get the input
  const dateSort = data.readUInt8(1);
  const maxPlayersSort = data.readUInt8(2);
  const username = data.slice(3);

  // Get the first available lobby
  const lobby = findLobby(dateSort, maxPlayersSort);
  if (!lobby) return confirmError(errors.lobbyNotFound);
  const { players, freeIds } = lobby;

  // Add the player to the lobby
  const playerId = freeIds.shift();
  state.id = playerId;
  state.lobby = lobby;
  state.username = username;
  players.push(client);

  // Build the sender response
  const size = 8 + players.reduce((size, player) => (size + player.state.username.length + 2), 0);
  const senderResponse = Buffer.alloc(size);
  senderResponse.writeUInt8(commandId);
  senderResponse.writeUInt8(errors.noError, 1);
  senderResponse.writeUInt32LE(lobby.id, 2);
  senderResponse.writeUInt8(players.length, 6);
  senderResponse.writeUInt8(playerId, 7);
  let offset = 8;
  players.forEach(player => {
    senderResponse.writeUInt8(player.state.id, offset++);
    senderResponse.write(player.state.username + '\0', offset);
    offset += player.state.username.length + 1;
  });

  client.send(senderResponse);

  // Broadcast the message
  const broadcastResponse = Buffer.alloc(3 + username.length);
  broadcastResponse.writeUInt8(commandIds.lobby_player_joined);
  broadcastResponse.writeUInt8(playerId, 1);
  broadcastResponse.write(username + '\0', 2);
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
