const { errors } = require('../lib/errors');

/**
 * Set the allow join lobby flag
 */
exports.handler = ({ client, data, lobby, commandId }, { send, sendError }) => {
  // Get the input
  const allowJoin = data.readUInt8(2);

  // Lobby check
  if (!lobby) return sendError(errors.lobbyNotFound);
  if (lobby.adminId !== client.id) return sendError(errors.unauthorized);

  // Set the flag
  lobby.allowJoin = allowJoin;

  // Send the confirmation
  send(Buffer.alloc(1).writeUInt8(commandId));
};

/**
interface Input {
  commandId           u8
  allowJoin           u8
}

interface Output {
  commandId           u8
}
*/
