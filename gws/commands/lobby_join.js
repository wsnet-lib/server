const crypto = require('crypto');
const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');
const { getLobby } = require('../models/lobby');

/**
 * Join a lobby
 */
exports.handler = ({ client, data, state, commandId, sendBroadcast, confirmError }) => {
  // Get the input
  const lobbyId = data.readUInt32LE(1);
  const nullCharIndex = data.indexOf(0, 5);
  const inputLobbyPassword = data.slice(5, nullCharIndex).toString();
  const username = data.slice(nullCharIndex + 1).toString();

  // Lobby check
  const lobby = getLobby(lobbyId);
  if (!lobby) return confirmError(errors.lobbyNotFound);
  const { password: lobbyPassword, players, maxPlayers, freeIds } = lobby;

  // Max players check
  if (players.length >= maxPlayers || !freeIds.length) {
    return confirmError(errors.lobbyNotFound);
  }

  // Password check, if needed
  if (lobbyPassword) {
    const hash1 = crypto.createHash('sha1').update(inputLobbyPassword).digest('hex');
    const hash2 = crypto.createHash('sha1').update(lobbyPassword).digest('hex');
    if (!crypto.timingSafeEqual(hash1, hash2)) return confirmError(errors.wrongPassword);
  }

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
  senderResponse.writeUInt32LE(lobbyId, 2);
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
  lobbyId             u32
  lobbyPassword?      string
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
  lobby_player_joined u8
  playerId            u8
  playerName          string
*/
