const { lobbies } = require('../models/lobby');

/**
 * Get the lobbies list
 */
exports.handler = ({ client, commandId, udpHeaderSize, appendUdpHeader }) => {
  // Get the lobbies
  const lobbiesList = Object.values(lobbies);

  // Calculate the payload size
  const size = 1 + lobbiesList.reduce((size, lobby) => (size + lobby.name.length + 8), 0);

  // Write the response buffer
  const payload = Buffer.allocUnsafe(size + udpHeaderSize);
  let offset = 0;

  // Command ID
  payload[offset++] = commandId;

  for (let i = 0, len = lobbiesList.length; i < len; i++) {
    const lobby = lobbiesList[i];

    // Lobby ID
    payload.writeUInt32LE(lobby.id, offset);
    offset += 4;

    // Lobby name
    payload.write(lobby.name + '\0', offset);
    offset += lobby.name.length + 1;

    // Players count
    payload[offset++] = lobby.players.length;

    // Max players
    payload[offset++] = lobby.maxPlayers;

    // Has password
    payload[offset++] = lobby.password ? 1 : 0;
  }

  // Send the response
  if (udpHeaderSize) appendUdpHeader(payload);
  client.send(payload);
};

/**
interface Input {
  commandId       u8
}

interface Output {
  commandId         u8
  [
    id              u32
    name            string
    playersCount    u8
    maxPlayers      u8
    hasPassword     u8
  ]
*/
