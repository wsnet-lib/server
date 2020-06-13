const { errors } = require('../lib/errors'); 
const { commandIds } = require('../lib/commands');

/**
 * Transfer the lobby ownership to another player
 */
exports.handler = ({ client, state, data, lobby, commandId, sendBroadcast, confirmError }) => {
  // Get the new admin ID
  const newAdminId = data.readUInt8(1);

  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return confirmError(errors.unauthorized);

  // Set the lobby admin
  lobby.adminId = newAdminId;

  // confirm the new_admin change
  const response = Buffer.alloc(3); 
  response.writeUInt8(commandId); 
  response.writeUInt8(errors.noError);
  response.writeUInt8(newAdminId); 
  client.send(response);

  // Broadcast the new admin to all players
  const response = Buffer.alloc(2);
  response.writeUInt8(commandIds.lobby_transfer_changed);
  response.writeUInt8(newAdminId);
  sendBroadcast(response);

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
