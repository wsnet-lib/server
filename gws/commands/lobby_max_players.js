const { errors } = require('../lib/errors');

/**
 * Set the
 * @param {Request} req
 * @param {Response} res
 */
exports.handler = ({ data, lobby, commandId }, { send, sendError }) => {
  // Get the input
  const maxPlayers = data.readUInt8(2);

  // Get the players list
  if (!lobby) return sendError(errors.lobbyNotFound);

  // Set the flag
  lobby.maxPlayers = maxPlayers;

  // Send the confirmation
  send(Buffer.alloc(1).writeUInt8(commandId));
};

/**
interface Input {
  commandId           u8
  maxPlayers          u8
}

interface Output {
  commandId           u8
*/
