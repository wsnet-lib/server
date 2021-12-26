const { errors } = require('../lib/errors');

/**
 * Ack a UDP reliable packet
 * (UDP-only command)
 */
exports.handler = ({ server, packetId, sendError }) => {
  if (!server.reliablePackets[packetId]) {
    return sendError(packetId, errors.reliablePacketNotFound);
  }

  delete server.reliablePackets[packetId];
};
