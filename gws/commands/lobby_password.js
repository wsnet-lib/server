const crypto = require('crypto');
const { errors } = require('../lib/errors');

/**
 * Set the player username
 */
exports.handler = ({ sendConfirm, state, data, lobby, confirmError }) => {
  // Get the input
  const newPassword = data.slice(1, data.indexOf(0, 1));

  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return confirmError(errors.unauthorized);

  // Set the lobby password
  lobby.password = crypto.createHash('sha1').update(newPassword).digest();

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
