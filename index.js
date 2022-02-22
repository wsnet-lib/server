const protocols = require('./protocols');

// Start the server
const protocol = process.argv.length > 2 ? process.argv[2].slice(2) : 'ws';
const start = protocols[protocol];

if (!start) {
  throw new Error('Invalid protocol specified. Valid protocols: --ws or --udp');
}

start({
  address: process.env.ADDRESS ?? '0.0.0.0',
  port: process.env.PORT ?? 8080,
  behindProxy: process.env.BEHIND_PROXY,

  onListen({ address }) {
    console.info();
    console.info(`${new Date().toLocaleString()} [${protocol.toUpperCase()} SERVER] Ready on ${address}`);
  },

  onClientConnection({ id }) {
    console.debug(`${new Date().toLocaleString()} [${protocol.toUpperCase()} SERVER] Client ${id} has connected`);
  },

  onClientDisconnection({ id }) {
    console.debug(`${new Date().toLocaleString()} [${protocol.toUpperCase()} SERVER] Client ${id} has disconnected`);
  },

  onDebug(message) {
    // Enable to log debug messages
    console.debug(`${new Date().toLocaleString()} [${protocol.toUpperCase()} SERVER] ${message}`);
  },

  // UDP Events
  onPacketDiscarded({ packetId, currentClientPacketId }) {
    console.debug(`${new Date().toLocaleString()} [${protocol.toUpperCase()} SERVER] A packet with ID ${packetId} was received out-of-order and has been discarded. Current packet sequence: ${currentClientPacketId}`);
  },

  onReliablePacketResend(resentPackets, totalReliablePackets, client) {
    console.debug(`${new Date().toLocaleString()} [${protocol.toUpperCase()} SERVER] ${resentPackets.length} out of ${totalReliablePackets} reliable packets of the client ${client.id} have been resent`);
  },

  onReliablePacketDiscarded(packet) {
    console.debug(`${new Date().toLocaleString()} [${protocol.toUpperCase()} SERVER] The reliable packet with ID ${packet.id} has not been acked from the client after some tempts and has been discarded`);
  }
});