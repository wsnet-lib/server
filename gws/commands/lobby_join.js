const bcrypt = require('bcryptjs');
const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commands');
const { getLobby } = require('../models/lobby');

/**
 * Join a lobby
 */
exports.handler = async ({ client, data, state, commandId, sendBroadcast, sendError }) => {
  // Get the input
  const lobbyId = data.readUInt32LE(1);
  const nullCharIndex = data.indexOf(0, 5);
  const inputLobbyPassword = data.slice(5, nullCharIndex).toString();
  const username = data.slice(nullCharIndex + 1).toString();

  // Lobby check
  const lobby = getLobby(lobbyId);
  if (!lobby) return sendError(errors.lobbyNotFound);
  const { password: lobbyPassword, players, maxPlayers, freeIds } = lobby;

  // Max players check
  if (players.length >= maxPlayers || !freeIds.length) {
    return sendError(errors.lobbyJoinNotFound);
  }

  // Password check, if needed
  if (lobbyPassword && !await bcrypt.compare(inputLobbyPassword, lobbyPassword)) {
    return sendError(errors.wrongPassword);
  }

  // Add the player to the lobby
  const playerId = freeIds.shift();
  state.id = playerId;
  state.lobby = lobby;
  state.username = username;
  players.push(client);

  // Build the sender response
  const size = 7 + players.reduce((size, player) => (size + player.state.username.length + 2), 0);
  const senderResponse = Buffer.alloc(size);
  senderResponse.writeUInt8(commandId);
  senderResponse.writeUInt32LE(lobbyId);
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
  lobbyId             u32
  lobbyPassword?      string
  username            string
}

interface SenderOutput {
  commandId           u8
  lobbyId             u32
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
