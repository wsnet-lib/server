const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commands');
const { deleteLobby } = require('../models/lobby');

/**
 * Kick or ban a player
 */
exports.handler = ({ client, lobby, state, commandId, sendBroadcast, sendConfirm, confirmError }) => {
  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);

  // Remove the player from the lobby
  const { players } = lobby;
  const { id: playerId } = client;
  const playerLobbyIdx = players.findIndex(player => player.state.id === playerId);
  if (!playerLobbyIdx) return confirmError(errors.playerNotFound);
  players.splice(playerLobbyIdx, 1);
  lobby.freeIds.push(playerId);

  let deletedLobby = false;
  state.lobby = null;

  // If this user was an admin, assign the admin to another player if any, or delete the lobby
  if (lobby.adminId === state.id) {
    if (players.length) {
      lobby.adminId = players[0].id;
    } else {
      deleteLobby(lobby.id);
      deletedLobby = true;
    }
  }

  // Broadcast the removed player to all the other lobby players
  if (!deletedLobby) {
    const response = Buffer.alloc(3);
    response.writeUInt8(commandIds.lobby_player_left);
    response.writeUInt8(playerId);
    response.writeUInt8(lobby.adminId);
    sendBroadcast(response);
  }

  // Send the confirmation to the sender
  sendConfirm();
};

/**
interface Input {
  commandId           u8
}

interface BroadcastOutput {
  commandId           u8
  playerId            u8
  adminId             u8
}
*/
