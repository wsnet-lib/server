const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');

/**
 * Transfer the lobby ownership to another player
 */
exports.handler = ({ client, state, data, lobby, commandId, sendBroadcast, confirmError }) => {
  // Get the new admin ID
  const newAdminId = data.readUInt8(1);

  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id || newAdminId === state.id) return confirmError(errors.unauthorized);

  // Set the lobby admin
  lobby.adminId = newAdminId;

  // Confirm the new_admin change
  const response = Buffer.alloc(3);
  response.writeUInt8(commandId);
  response.writeUInt8(errors.noError, 1);
  response.writeUInt8(newAdminId, 2);
  client.send(response);

  // Broadcast the new admin to all players
  const broadcastResponse = Buffer.alloc(2);
  broadcastResponse.writeUInt8(commandIds.lobby_transfer_changed);
  broadcastResponse.writeUInt8(newAdminId, 1);
  sendBroadcast(broadcastResponse);
};

/**
interface Input {
  commandId           u8
  newAdminId          u8
}

interface SenderOutput {
  commandId           u8
  error               u8
  newAdminId          u8
}

interface BroadcastOutput {
  commandId           u8
  newAdminId          u8
}
*/
