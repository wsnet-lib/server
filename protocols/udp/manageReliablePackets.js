exports.manageReliablePackets = ({ server, options }) => {
  const { onReliablePacketResend, onReliablePacketDiscarded } = options;
  const maxReliableTempts = options.maxReliableTempts || 3;
  const reliablePacketStaleTime = options.reliablePacketStaleTime || 1500;

  setInterval(() => {
    const now = +new Date();

    for (const client of server.clients) {
      const { reliablePackets } = client;
      const resentPackets = [];
      let totalReliablePackets = 0;

      // Reliable packets management
      for (const packetId in reliablePackets) {
        const packet = reliablePackets[packetId];

        // Discard the packet if it has reached the max tempts
        if (packet.tempts > maxReliableTempts) {
          delete reliablePackets[packetId];
          onReliablePacketDiscarded && onReliablePacketDiscarded(packet);
          continue;
        }

        totalReliablePackets++;

        // If the packet has not been acked after few time, re-send it
        if (now > packet.sentAt + reliablePacketStaleTime) {
          resentPackets.push(packet);
          packet.tempts++;
          delete reliablePackets[packetId];
          server.send(packet.buffer, client.port, client.address);
        }
      }

      if (totalReliablePackets) {
        onReliablePacketResend && onReliablePacketResend(resentPackets, totalReliablePackets, client);
      }
    }
  }, 1000);
};
