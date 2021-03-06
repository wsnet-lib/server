const crypto = require('crypto');
const { errors } = require('../lib/errors');

/**
 * Set the lobby password
 */
exports.handler = ({ sendConfirm, state, data, lobby, confirmError }) => {
  // Get the input
  const newPassword = data.slice(1, data.indexOf(0, 1)).toString() || null;

  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return confirmError(errors.unauthorized);

  // Set the lobby password
  lobby.password = newPassword ? crypto.createHash('sha1').update(newPassword).digest() : null;

  // Send the confirm
  sendConfirm();
};

/**
interface Input {
  commandId           u8
  newPassword         string
}

interface SenderOutput {
  commandId           u8
  error               u8
}
*/
