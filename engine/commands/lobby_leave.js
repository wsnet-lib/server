const { errors } = require('../lib/errors');
const { removePlayer } = require('../models/lobby');

/**
 * Kick or ban a player
 */
exports.handler = ({ client, lobby, state, sendConfirm, sendConfirmWithError, udpHeaderSize }) => {
  // Lobby check
  if (!lobby) return sendConfirmWithError(errors.lobbyNotFound);

  // Remove the player from the lobby
  if (!removePlayer(client, udpHeaderSize)) return sendConfirmWithError(errors.playerNotFound);

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
