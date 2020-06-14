const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commands');
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
  senderResponse.writeUInt8(errors.noError);
  senderResponse.writeUInt32LE(lobby.id);
  senderResponse.writeUInt8(players.length);
  senderResponse.writeUInt8(playerId);

  players.forEach(player => {
    senderResponse.writeUInt8(player.state.id);
    senderResponse.write(player.state.username + '\0');
  });

  client.send(senderResponse);

  // Broadcast the message
  const broadcastResponse = Buffer.alloc(3 + username.length);
  broadcastResponse.writeUInt8(commandIds.lobby_player_joined);
  broadcastResponse.writeUInt8(playerId);
  broadcastResponse.write(username + '\0');
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
