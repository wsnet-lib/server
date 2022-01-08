const { serverUuid } = require('../../protocols/udp/config');
const { commandIds } = require('./commandIds');

/**
 * Send the buffer to the client with the current player data (if in a lobby)
 */
exports.sendLobbyDataBuffer = ({ client, createBuffer }) => {
  const { id, lobby, username } = client.state;

  if (!lobby) {
    const buffer = createBuffer(3 + serverUuid.length);
    buffer.writeU8(commandIds.lobby_data);
    buffer.writeString(serverUuid);
    buffer.writeU8(0); // "In a lobby" flag
    buffer.send();
  } else {
    const { players } = lobby;
    const usernameSize = username.length + 1;
    const size = 10 + usernameSize + players.reduce((size, player) => (size + player.state.username.length + 2), 0) +
      serverUuid.length;
    const buffer = createBuffer(size);
    buffer.writeU8(commandIds.lobby_data);
    buffer.writeString(serverUuid);
    buffer.writeU8(1); // "In a lobby" flag
    buffer.writeU32(lobby.id);
    buffer.writeU8(lobby.adminId);
    buffer.writeU8(id);
    buffer.writeString(username);

    buffer.writeU8(players.length);
    players.forEach(player => {
      buffer.writeU8(player.state.id);
      buffer.writeString(player.state.username);
    });

    buffer.send();
  }
};
