const { errors } = require('../lib/errors');

/**
 * Send or broadcast a generic message
 */
exports.handler = ({ data, lobby, state, commandId, sendBroadcast, sendError }) => {
  // Get the input
  const receiverId = data[1];

  // Get the players list
  if (!lobby) return sendError(errors.lobbyNotFound);

  // Build the response
  const responseHeader = Buffer.alloc(2);
  responseHeader[0] = commandId;
  responseHeader[1] = state.id;
  const response = Buffer.concat([responseHeader, data.slice(2)]);

  // Broadcast or send the message
  if (receiverId === 255) {
    // Broadcast the message to the lobby players
    sendBroadcast(response);
  } else {
    // Find the receiver player
    const receiver = lobby.players.find(player => player.state.id === receiverId);

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
