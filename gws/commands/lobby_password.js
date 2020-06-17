const crypto = require('crypto');
const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');

/**
 * Set the player username
 */
exports.handler = ({ client, state, data, lobby, confirmError }) => {
  // Get the input
  const newPassword = data.slice(1, data.indexOf(0, 1));

  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return confirmError(errors.unauthorized);

  // Set the lobby password
  lobby.password = crypto.createHash('sha1').update(newPassword).digest();

  // Send the confirm
  const response = Buffer.alloc(2);
  response[0] = commandIds.lobby_password_changed;
  response[1] = errors.noError;
  client.send(response);
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
