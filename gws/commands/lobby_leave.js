const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');
const { deleteLobby } = require('../models/lobby');

/**
 * Kick or ban a player
 */
exports.handler = ({ lobby, state, sendBroadcast, sendConfirm, confirmError }) => {
  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);

  // Remove the player from the lobby
  const { players } = lobby;
  const { id: playerId } = state;
  const playerLobbyIdx = players.findIndex(player => player.state.id === playerId);
  if (!playerLobbyIdx) return confirmError(errors.playerNotFound);

  // Remove the player from the lobby
  players.splice(playerLobbyIdx, 1);
  lobby.freeIds.push(playerId);

  let deletedLobby = false;

  // If this user was an admin, assign the admin to another player if any, or delete the lobby
  if (lobby.adminId === playerId) {
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
    response[0] = commandIds.lobby_player_left;
    response[1] = playerId;
    response[2] = lobby.adminId;
    sendBroadcast(response);
  }

  delete state.id;
  delete state.lobby;
  delete state.username;
  lobby = null;

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
