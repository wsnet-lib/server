const { errors } = require('../lib/errors');

/**
 * Set the allow join lobby flag
 */
exports.handler = ({ client, state, data, lobby, commandId, sendError }) => {
  // Get the input
  const allowJoin = data.readUInt8(2);

  // Lobby check
  if (!lobby) return sendError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return sendError(errors.unauthorized);

  // Set the flag
  lobby.allowJoin = allowJoin;

  // Send the confirm to the sender
  const confirm = Buffer.alloc(1);
  confirm.writeUInt8(commandId);
  client.send(confirm);
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
