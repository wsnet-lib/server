const { errors } = require('../lib/errors');

/**
 * Set the max players lobby flag
 */
exports.handler = ({ client, data, lobby, sendConfirm, sendError }) => {
  // Get the input
  const maxPlayers = data.readUInt8(2);

  // Lobby check
  if (!lobby) return sendError(errors.lobbyNotFound);
  if (lobby.adminId !== client.id) return sendError(errors.unauthorized);

  // Set the flag
  lobby.maxPlayers = maxPlayers;

  // Send the confirmation to the sender
  sendConfirm();
};

/**
interface Input {
  commandId           u8
  maxPlayers          u8
}

interface Output {
  commandId           u8
}
*/
