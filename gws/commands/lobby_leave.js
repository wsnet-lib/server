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
  if (!removePlayer(client)) return confirmError(errors.playerNotFound);

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
