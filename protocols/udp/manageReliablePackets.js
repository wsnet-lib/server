exports.manageReliablePackets = ({ server, options }) => {
  const { reliablePackets } = server;
  const { onMessageResend } = options;
  const maxReliableTempts = options.maxReliableTempts || 3;
  const reliablePacketStaleTime = options.reliablePacketStaleTime || 1500;

  setInterval(() => {
    const now = +new Date();

    // Reliable packets management
    for (const packetId in reliablePackets) {
      const packet = reliablePackets[packetId];

      // Discard the packet if it has reached the max tempts
      if (packet.tempts > maxReliableTempts) {
        delete reliablePackets[packetId];
        continue;
      }

      // If the packet has not been acked after few time, re-send it
      if (now > packet.sentAt + reliablePacketStaleTime) {
        packet.tempts++;
        delete reliablePackets[packetId];
        server.send(packet.buffer, packet.port, packet.address);
        onMessageResend && onMessageResend(packet);
      }
    }
  }, 1000);
};
