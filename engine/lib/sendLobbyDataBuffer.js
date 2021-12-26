const { commandIds } = require('./commandIds');

/**
 * Send the buffer to the client with the current player data (if in a lobby)
 */
exports.sendLobbyDataBuffer = ({ client, udpHeaderSize, appendUdpHeader }) => {
  const { id, lobby, username } = client.state;

  if (!lobby) {
    const buffer = Buffer.allocUnsafe(2 + udpHeaderSize);
    buffer[0] = commandIds.lobby_data;
    buffer[1] = 0; // "In a lobby" flag
    if (udpHeaderSize) appendUdpHeader(client, buffer, 2);
    client.send(buffer);
  } else {
    const { players } = lobby;
    const usernameSize = username.length + 1;
    const size = 9 + usernameSize + players.reduce((size, player) => (size + player.state.username.length + 2), 0);
    const buffer = Buffer.allocUnsafe(size + udpHeaderSize);
    buffer[0] = commandIds.lobby_data;
    buffer[1] = 1; // "In a lobby" flag
    buffer.writeUInt32LE(lobby.id, 2);
    buffer[6] = lobby.adminId;
    buffer[7] = id;
    buffer.write(username + '\0');

    let offset = 7 + usernameSize;
    buffer[offset] = players.length;
    offset++;

    players.forEach(player => {
      buffer[offset++] = player.state.id;
      buffer.write(player.state.username + '\0', offset);
      offset += player.state.username.length + 1;
    });
    buffer.forEach(byte => console.log);

    client.send(buffer);
  }
};
