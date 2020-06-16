const WebSocket = require('ws');
const { execCommand } = require('./lib/execCommand');
const { errors } = require('./lib/errors');
const { commandIds } = require('./lib/commandIds');

/** @type {WebSocket.Server} */
let server;

/** Get the server instance
 * @return {WebSocket.Server}
 */
exports.getServer = () => server;

/* Set the user connection to alive after a pong event */
function heartbeat() {
  this.isAlive = true;
}

/** Start the server
 * @param {Object=} options
 */
exports.start = (options = {}) => {
  const isServerBehindProxy = options.proxy;
  const onClientConnection = options.onClientConnection;
  const onClientError = options.onClientError || console.error;

  server = new WebSocket.Server({
    port: options.port || 8080
  });

  server.on('connection', (client, req) => {
    /**
     * Client player state
     * @type {ClientState}
     */
    client.state = {
      ip: isServerBehindProxy ? req.headers['x-forwarded-for'].split(/\s*,\s*/)[0] : req.socket.remoteAddress
    };

    // Handle the pong event
    client.isAlive = true;
    client.on('pong', heartbeat);

    client.on('error', (error) => {
      onClientError(error);
      client.terminate();
    });

    client.on('message', (data) => {
      try {
        execCommand(server, client, data);
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
    client.onclose = () => {
      console.log('Client connection closed 1');
    };

    client.on('close', () => {
      console.log('Client connection closed 2');
    });

    onClientConnection && onClientConnection(client, req);
  });

  // Ping handler
  const interval = setInterval(() => {
    const clients = server.clients;
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      if (!client.isAlive) return client.terminate();
      client.isAlive = false;
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
