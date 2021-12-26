const { errors } = require('../lib/errors');

/**
 * Send or broadcast a generic message
 */
exports.handler = (ctx) => {
  const { onGameMessage, data, lobby, state, client, sendError } = ctx;

  // Get the input
  const receiverId = data[1];

  // Get the players list
  if (!lobby) return sendError(errors.lobbyNotFound);
  const { players } = lobby;

  // Get the transformed response
  const response = onGameMessage ? onGameMessage(ctx) : data;

  // Overwrite the receiver with the sender ID
  response[1] = state.id;

  // Broadcast or send the message
  if (receiverId === 255) {
    for (let i = 0, len = players.length; i < len; i++) {
      const player = players[i];
      client !== player && player.send(response);
    }
  } else {
    // Find the receiver player
    let receiverPlayer;
    for (let i = 0, len = players.length; i < len; i++) {
      const player = players[i];
      if (player.state.id === receiverId) {
        receiverPlayer = player;
        break;
      }
    }

    // If the receiver does not exists anymore, send an error to the sender
    if (!receiverPlayer) return sendError(errors.playerNotFound);

    // Send the message to the receiver
    receiverPlayer.send(response);
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
  payload             any
*/
