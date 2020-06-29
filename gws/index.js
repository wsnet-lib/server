const WebSocket = require('ws');
const shortHash = require('short-hash');
const { execCommand } = require('./lib/execCommand');
const { errors } = require('./lib/errors');
const { commandIds } = require('./lib/commandIds');
const { removePlayer } = require('./models/lobby');
const { getPlayer } = require('./models/player');

/** @type {WebSocket.Server} */
let server;

/** Get the server instance
 * @return {WebSocket.Server}
 */
exports.getServer = () => server;

/** Start the server
 * @param {Object=} options
 */
exports.start = (options = {}) => {
  const isServerBehindProxy = options.behindProxy === undefined || options.behindProxy === 'true';
  const onClientConnection = options.onClientConnection;
  const onClientError = options.onClientError || console.error;
  const autoReconnectPlayers = options.autoReconnectPlayers === 'true';

  server = new WebSocket.Server({
    port: options.port || 8080
  });

  server.on('connection', (client, req) => {
    /**
     * Client player state
     * @type {ClientState}
     */
    client.state = getPlayer(
      isServerBehindProxy && req.headers['x-forwarded-for']
        ? shortHash(req.headers['x-forwarded-for'].split(/\s*,\s*/)[0])
        : shortHash(req.socket.remoteAddress),
      autoReconnectPlayers
    );

    // Set the user connection to alive after a pong event
    client.isAlive = true;
    client.on('pong', () => {
      console.debug(`[PONG] Received pong event from client ${client.state.ip}`);
      client.isAlive = true;
    });

    client.on('error', (error) => {
      onClientError(error);

      // Try to send a generic error to the client
      try {
        const errorBuffer = Buffer.alloc(2);
        errorBuffer[0] = commandIds.error;
        errorBuffer[1] = errors.serverError;
        client.send(errorBuffer);
      } catch (sendError) {
        onClientError(sendError);
      }

      client.terminate();
    });

    client.on('message', (data) => {
      try {
        execCommand(server, client, data, options.onGameMessage);
      } catch (err) {
        onClientError(err);

        // Try to send a generic error to the client
        try {
          const errorBuffer = Buffer.alloc(2);
          errorBuffer[0] = commandIds.error;
          errorBuffer[1] = errors.serverError;
          client.send(errorBuffer);
        } catch (sendError) {
          onClientError(sendError);
        }
      }
    });

    // Handle the client disconnection
    client.on('close', () => !autoReconnectPlayers && client.state.lobby && removePlayer(client.state));

    onClientConnection && onClientConnection(client, req);
  });

  // Ping handler
  const interval = setInterval(() => {
    for (const client of server.clients) {
      if (!client.isAlive) {
        client.close(1000, 'Closing..');
        // setTimeout(() => client.terminate(), 3000);
        return;
      }

      client.isAlive = false;
      console.debug(`[PING] Sending ping message to the client ${client.state.ip}`);
      client.ping();
    }
  }, options.pingInterval || 30000);

  server.on('close', () => {
    clearInterval(interval);
    options.onClose && options.onClose();
  });

  server.on('listening', () => {
    const info = server.address();
    options.onListen && options.onListen({ address: `${info.address}:${info.port}` });
  });

  server.on('error', options.onServerError || console.error);
};
