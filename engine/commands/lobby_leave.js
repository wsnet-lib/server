const { errors } = require('../lib/errors');
const { removePlayer } = require('../models/lobby');

/**
 * Kick or ban a player
 */
exports.handler = ({ lobby, state, sendConfirm, sendConfirmWithError }) => {
  // Lobby check
  if (!lobby) return sendConfirmWithError(errors.lobbyNotFound);

  // Remove the player from the lobby
  if (!removePlayer(state)) return sendConfirmWithError(errors.playerNotFound);

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
