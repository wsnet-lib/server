const { errors } = require('../lib/errors');
const { deleteLobby } = require('../models/lobby');

/**
 * Kick or ban a player
 */
exports.handler = ({ client, lobby, commandId, sendBroadcast, sendError }) => {
  // Lobby check
  if (!lobby) return sendError(errors.lobbyNotFound);

  // Remove the player from the lobby
  const { players } = lobby;
  const { id: playerId } = client;
  const playerLobbyIdx = players.findIndex(player => player.id === playerId);
  if (!playerLobbyIdx) return sendError(errors.playerNotFound);
  players.splice(playerLobbyIdx, 1);
  lobby.freeIds.push(playerId);

  let deletedLobby = false;

  // If this user was an admin, assign the admin to another player if exists or delete the lobby
  if (lobby.adminId === client.id) {
    if (players.length) {
      const anotherPlayer = players[0];
      lobby.adminId = anotherPlayer.id;
    } else {
      deleteLobby(lobby.id);
      deletedLobby = true;
    }
  }

  // Broadcast the removed player to all the other lobby players
  if (!deletedLobby) {
    const response = Buffer.alloc(2);
    response.writeUInt8(commandId);
    response.writeUInt8(playerId);
    response.writeUInt8(lobby.adminId);
    sendBroadcast(response);
  }

  // Send the confirmation to the sender
  const confirm = Buffer.alloc(1);
  confirm.writeUInt8(commandId);
  client.send(confirm);
};

/**
interface Input {
  commandId           u8
}

interface Output {
  commandId           u8
  playerId            u8
  adminId             u8
}
*/
