const { errors } = require('../lib/errors');

/**
 * Transfer the lobby ownership to another player
 */
exports.handler = ({ client, state, data, lobby, commandId, sendBroadcast, sendError }) => {
  // Get the new admin ID
  const newAdminId = data.readUInt8(1);

  // Lobby check
  if (!lobby) return sendError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return sendError(errors.unauthorized);

  // Set the lobby admin
  lobby.adminId = newAdminId;

  // Broadcast the new admin to all players
  const response = Buffer.alloc(2);
  response.writeUInt8(commandId);
  response.writeUInt8(newAdminId);
  sendBroadcast(response);

  /*
  // Send the confirmation
  const confirm = Buffer.alloc(1);
  confirm.writeUInt8(commandId);
  client.send(confirm);
  */
};

/**
interface Input {
  commandId           u8
  newAdminId          u8
}

interface Output {
  commandId           u8
  newAdminId          u8
}
*/
