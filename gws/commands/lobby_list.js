const { getLobbies } = require('../models/lobby');

/**
 * Get the lobbies list
 * @param {Object<Request>} req
 * @param {Object<Response>} res
 */
exports.handler = ({ client, commandId }) => {
  // Get the lobbies
  const lobbies = Object.values(getLobbies());

  // Calculate the payload size
  const size = 1 + lobbies.reduce((size, lobby) => (size + lobby.name.length + 8), 0);

  // Write the response buffer
  const payload = Buffer.alloc(size);
  let offset = 0;

  // Command ID
  payload[offset++] = commandId;

  for (let i = 0, len = lobbies.length; i < len; i++) {
    const lobby = lobbies[i];

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
    payload[offset] = lobby.password ? 1 : 0;
  }

  // Send the response
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
