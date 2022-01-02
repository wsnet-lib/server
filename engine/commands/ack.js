const { errors } = require('../lib/errors');

/**
 * Ack a UDP reliable packet
 * (UDP-only command)
 */
exports.handler = ({ client, packetId, sendError }) => {
  if (!client.reliablePackets[packetId]) {
    return sendError(packetId, errors.reliablePacketNotFound);
  }

  delete client.reliablePackets[packetId];
};
