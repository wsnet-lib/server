const { getLobbies } = require('../models/lobby');

/**
 * Get the lobbies list
 * @param {Object<Request>} req
 * @param {Object<Response>} res
 */
exports.handler = ({ client, commandId }) => {
  // Get the lobbies
  const lobbies = getLobbies();

  // Calculate the payload size
  const size = lobbies.reduce((size, lobby) => (size + lobby.name.length + 9), 0);

  // Write the response buffer
  const payload = Buffer.alloc(1 + size);
  let offset = 0;

  // Command ID
  payload.writeUInt8(commandId, offset++);

  lobbies.forEach(lobby => {
    // Lobby ID
    payload.writeUInt32LE(lobby.id, offset);
    offset += 4;

    // Lobby name
    payload.write(lobby.name + '\0');
    offset += lobby.name.length + 1;

    // Players count
    payload.writeUInt8(lobby.players.length, offset++);

    // Max players
    payload.writeUInt8(lobby.maxPlayers, offset++);

    // Has password
    payload.writeUInt8(lobby.password ? 1 : 0, offset);
  });

  // Send the response
  client.send(payload);
};

/**
interface Output {
  commandId       u8
  id              u32
  name            string
  playersCount    u8
  maxPlayers      u8
  hasPassword     u8
*/
