const WebSocket = require('ws');
const { execCommand } = require('./commands');

/** WebSocket.Server */
let server;

/** Get the server instance */
exports.getServer = () => server;

/* Set the user connection to alive after a pong event */
function heartbeat() {
  this.isAlive = true;
}

/** Start the server */
exports.start = (options = {}) => {
  // const isServerBehindProxy = options.proxy // @TODO: Update v1.0
  const onClientConnection = options.onClientConnection;
  const onClientError = options.onClientError || console.error;

  server = new WebSocket.Server({
    port: options.port || 8080
  });

  server.on('connection', (client, req) => {
    // Client game state
    client.state = {};

    // Handle the pong event
    client.isAlive = true;
    client.on('pong', heartbeat);

    client.on('error', (error) => {
      onClientError(error);
      client.terminate();
    });

    client.on('message', (data) => {
      try {
        execCommand(client, data);
      } catch (err) {
        onClientError(err);
      }
    });

    // Get the user IP
    // @TODO: Update v1.0
    // const userIp = isServerBehindProxy ? req.headers['x-forwarded-for'].split(/\s*,\s*/)[0] : req.socket.remoteAddress

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
    // @TODO: Update v1.0
    options.onListen && options.onListen({ /* address: server.address() */ });
  });

  server.on('error', options.onServerError || console.error);
};
