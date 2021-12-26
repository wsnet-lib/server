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

  onClientConnection({ address, port }) {
    console.debug(`[${protocol.toUpperCase()} SERVER] New client connected from address ${address}:${port}`);
  },

  onDebug(message) {
    console.debug(`[${protocol.toUpperCase()} SERVER] ${message}`);
  },

  onListen({ address }) {
    console.info(`[${protocol.toUpperCase()} SERVER] Ready on ${address}`);
  },

  // UDP Events
  onPacketDiscarded({ msgId }) {
    console.debug(`[${protocol.toUpperCase()} SERVER] A packet with ID ${msgId} was received out-of-order and has been discarded`);
  },

  onPacketResend({ msgId }) {
    console.debug(`[${protocol.toUpperCase()} SERVER] A packet with ID ${msgId} was not acked from the client and has been re-sent`);
  }
});
