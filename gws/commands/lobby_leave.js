const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');
const { removePlayer, resetPlayerState } = require('../models/lobby');

/**
 * Kick or ban a player
 */
exports.handler = ({ client, lobby, state, sendBroadcast, sendConfirm, confirmError }) => {
  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);

  // Remove the player from the lobby
  const status = removePlayer(client);
  if (status === -1) return confirmError(errors.playerNotFound);

  // Broadcast the removed player to all the other lobby players
  if (!status) {
    const response = Buffer.alloc(3);
    response[0] = commandIds.lobby_player_left;
    response[1] = state.id;
    response[2] = lobby.adminId;
    sendBroadcast(response);
  }

  // Reset the player state
  resetPlayerState(state);

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
