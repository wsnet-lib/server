const crypto = require('crypto');
const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');
const { getLobby } = require('../models/lobby');

const hasProp = Object.prototype.hasOwnProperty.bind(Object);

/**
 * Join a lobby
 */
exports.handler = ({ client, data, state, commandId, sendBroadcast, confirmError }) => {
  // Get the input
  const nullCharIndex = data.indexOf(0, 1);
  const username = data.slice(1, nullCharIndex).toString();
  const lobbyId = data.readUInt32LE(nullCharIndex + 1);
  const inputLobbyPassword = data.slice(nullCharIndex + 5, data.length - 1).toString();

  // Lobby check
  if (state.lobby) return confirmError(errors.alreadyInLobby);
  const lobby = getLobby(lobbyId);
  if (!lobby) return confirmError(errors.lobbyNotFound);
  const { password: lobbyPassword, players, maxPlayers, freeIds, bans } = lobby;

  // Bans check
  if (hasProp(bans, state.ip)) return confirmError(errors.unauthorized);

  // Max players check
  if (players.length >= maxPlayers || !freeIds.length) {
    return confirmError(errors.lobbyNotFound);
  }

  // Password check, if needed
  if (lobbyPassword) {
    const hashedInputPsw = crypto.createHash('sha1').update(inputLobbyPassword).digest();
    if (!crypto.timingSafeEqual(hashedInputPsw, lobbyPassword)) {
      return confirmError(errors.wrongPassword);
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
  const senderResponse = Buffer.alloc(size);
  senderResponse[0] = commandId;
  senderResponse[1] = errors.noError;
  senderResponse.writeUInt32LE(lobbyId, 2);
  senderResponse[6] = playerId;
  senderResponse[7] = lobby.adminId;
  senderResponse[8] = players.length;
  let offset = 9;
  players.forEach(player => {
    senderResponse[offset++] = player.state.id;
    senderResponse.write(player.state.username + '\0', offset);
    offset += player.state.username.length + 1;
  });

  client.send(senderResponse);

  // Broadcast the message
  const broadcastResponse = Buffer.alloc(3 + username.length);
  broadcastResponse[0] = commandIds.lobby_player_joined;
  broadcastResponse[1] = playerId;
  broadcastResponse.write(username + '\0', 2);
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
