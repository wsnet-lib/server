const udp = require('dgram');
const { EventEmitter } = require('stream');
const shortHash = require('short-hash');
const { commandIds } = require('../../engine/lib/commandIds');
const { removePlayer } = require('../../engine/models/lobby');
const { getPlayer } = require('../../engine/models/player');
const attachServerListeners = require('../../engine/lib/attachServerListeners');
const { execCommand } = require('../../engine/lib/execCommand');
const { manageReliablePackets } = require('./manageReliablePackets');
const { sendLobbyDataBuffer } = require('../../engine/lib/sendLobbyDataBuffer');
const { createNetBuffer } = require('../../engine/lib/buffer');

/** @type {udp.Socket} */
let server;

/** Get the server instance
 * @return {udp.Socket}
 */
exports.getServer = () => server;

/** Start the server
 * @param {Object=} options
 */
exports.start = (options = {}) => {
  const address = options.address ?? '0.0.0.0';
  const port = options.port ?? 8080;
  const onClientConnection = options.onClientConnection;
  const onClientDisconnection = options.onClientDisconnection;
  const onGameMessage = options.onGameMessage;
  const onDebug = options.onDebug || console.debug;
  const onPacketDiscarded = options.onPacketDiscarded;
  const autoReconnectPlayers = options.autoReconnectPlayers;
  const discardOutOfOrderPackets = options.discardOutOfOrderPackets !== false;

  server = udp.createSocket('udp4');
  server.protocol = 'UDP';

  // Connected clients
  server.clients = [];
  const clients = {};

  server.on('message', (data, info) => {
    const clientId = shortHash(info.address + ':' + info.port);
    let client = clients[clientId];

    /**
     * Create a wrapper for the buffer creation and ready to be sent
     * @param {Integer} size Buffer size
     * @param {Integer} [reliable] Reliable flag
     */
    const createBuffer = (size, reliable = 2) => createNetBuffer(client, null, size, reliable);

    // NEW CONNECTION: Create the client if this is its first message
    if (!client) {
      client = new EventEmitter();
      client.id = clientId;
      client.address = info.address;
      client.port = info.port;
      client.isAliveAt = +new Date();
      client.clientPacketId = 0; // Sequence of messages sent from the client
      client.serverPacketId = 0; // Sequence of messages sent from the server
      client.reliablePackets = {}; // Reliable packets map

      /**
       * Client player state
       * @type {ClientState}
       */
      client.state = getPlayer(clientId, autoReconnectPlayers);

      /**
       * Send a buffer to the client
       * If the packet is reliable and it is not acked in a few time, it will be resent
       *
       * @param {Buffer} buffer
       */
      client.send = (buffer) => {
        if (buffer[buffer.byteLength - 1] === 2) {
          const packetId = buffer.readUInt32LE(buffer.byteLength - 5);
          client.reliablePackets[packetId] = {
            id: packetId,
            buffer,
            client,
            sentAt: +new Date(),
            tempts: 0
          };
        }

        server.send(buffer, client.port, client.address);
      };

      /**
       * Send a reliable ping to the client
       */
      client.ping = () => {
        const buffer = Buffer.allocUnsafe(6);
        buffer[0] = commandIds.ping;
        buffer.writeUInt32LE(client.serverPacketId++, 1);
        buffer[5] = 0;
        server.send(buffer, client.port, client.address);
      };

      // Handle the client disconnection
      client.on('close', () => {
        client.closed = true;

        // Remove the player from the lobby (if auto-reconnection is not enabled)
        !autoReconnectPlayers && client.state.lobby && removePlayer(client, 5);

        // Remove the client from the connected clients
        server.clients.splice(server.clients.findIndex(client => client.id === clientId), 1);
        delete clients[clientId];
        onClientDisconnection && onClientDisconnection(client);
      });

      /**
       * Disconnect the player with a close event
       */
      client.close = () => client.emit('close');

      server.clients.push(client);
      clients[clientId] = client;
      onClientConnection && onClientConnection(client);

      // Send the initial event "lobby_data"
      sendLobbyDataBuffer({ client, createBuffer });
    }

    // Get the message ID and reliable flag
    const msgByteLength = data.byteLength;
    if (msgByteLength < 6) {
      return onDebug('Error decoding the incoming packet: invalid buffer size');
    }

    const cmdId = data[0];
    const packetId = data.readUInt32LE(msgByteLength - 5);
    const reliable = data.readUInt8(msgByteLength - 1);

    // Ack the client message when requested
    if (reliable === 1) {
      const replyBuffer = Buffer.allocUnsafe(data.byteLength);
      data.copy(replyBuffer, 0, 0, data.byteLength);
      replyBuffer[0] = commandIds.ack;
      replyBuffer[data.byteLength - 1] = 0;
      server.send(replyBuffer, client.port, client.address);
    }

    if (cmdId !== commandIds.ack) {
      // Discard out-of-order packets
      if (discardOutOfOrderPackets && packetId < client.clientPacketId) {
        return onPacketDiscarded && onPacketDiscarded({ packetId, currentClientPacketId: client.clientPacketId });
      }

      // Store the new message sequence.
      client.clientPacketId = packetId;
    }

    execCommand({ server, client, data, onGameMessage, packetId, reliable }, options);
  });

  attachServerListeners({ server, options });
  manageReliablePackets({ server, options });

  server.bind(port, address);
};
