const { errors } = require('../lib/errors');
const { commandIds } = require('../lib/commandIds');

/**
 * Set the player username
 */
exports.handler = ({ client, state, data, lobby, commandId, sendBroadcast, confirmError }) => {
  // Get the input
  const newUsername = data.slice(1, data.indexOf(0, 1));

  // Lobby check
  if (!lobby) return confirmError(errors.lobbyNotFound);

  // Set the username
  state.username = newUsername;

  // Send the confirm
  const response = Buffer.alloc(3 + newUsername.length);
  response[0] = commandId;
  response[1] = errors.noError;
  response.write(newUsername.length + '\0');
  client.send(response);

  // Broadcast the new name
  const broadcastResponse = Buffer.alloc(3 + newUsername.length);
  broadcastResponse[0] = commandIds.lobby_player_username;
  broadcastResponse[1] = state.id;
  response.write(newUsername.length + '\0');
  sendBroadcast(broadcastResponse);
};

/**
interface Input {
  commandId           u8
  newUsername         string
}

interface SenderOutput {
  commandId           u8
  error               u8
  newUsername         string
}

interface BroadcastOutput {
  commandId           u8
  playerId            u8
  newUsername         string
}
*/
