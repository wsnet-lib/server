const { errors } = require('../lib/errors');

/**
 * Set the allowJoin flag
 * @param {Request} req
 * @param {Response} res
 */
exports.handler = ({ data, lobby, commandId }, { send, sendError }) => {
  // Get the input
  const allowJoin = data.readUInt8(2);

  // Get the players list
  if (!lobby) return sendError(errors.lobbyNotFound);

  // Set the flag
  lobby.allowJoin = allowJoin;

  // Send the confirmation
  send(Buffer.alloc(1).writeUInt8(commandId));
};

/**
interface Input {
  commandId           u8
  allowJoin           u8
}

interface Output {
  commandId           u8
*/
