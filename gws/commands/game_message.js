const { errors } = require('../lib/errors');

/**
 * Send or broadcast a generic message
 */
exports.handler = ({ client, data, lobby, state, commandId, sendBroadcast, sendError }) => {
  // Get the receiverId
  const receiverId = data.readUInt8(1);

  // Get the players list
  if (!lobby) return sendError(errors.lobbyNotFound);
  const { players } = lobby;

  // Build the response
  const responseHeader = Buffer.alloc(2);
  responseHeader.writeUInt8(commandId);
  responseHeader.writeUInt8(state.id);
  const response = Buffer.concat([responseHeader, data.slice(2)]);

  // Broadcast or send the message
  if (receiverId === 255) {
    // Broadcast the message to the lobby players
    sendBroadcast(response);

    // Send the confirm to the sender
    const confirm = Buffer.alloc(1);
    confirm.writeUInt8(commandId);
    client.send(confirm);
  } else {
    // Find the receiver player
    const receiver = players.find(player => player.id === receiverId);

    // If the receiver does not exists anymore, send an error to the sender
    if (!receiver) return sendError(errors.playerNotFound);

    // Send the message to the receiver
    receiver.send(response);
  }
};

/**
interface Input {
  commandId           u8
  receiverId          u8
  payload             any
}

interface ReceiverOutput {
  commandId           u8
  senderId            u8
  payload             any
*/
