const WebSocket = require('ws');
const shortHash = require('short-hash');
const { execCommand } = require('../../engine/lib/execCommand');
const { errors } = require('../../engine/lib/errors');
const { commandIds } = require('../../engine/lib/commandIds');
const { removePlayer } = require('../../engine/models/lobby');
const { getPlayer } = require('../../engine/models/player');
const attachServerListeners = require('../../engine/lib/attachServerListeners');
const { sendLobbyDataBuffer } = require('../../engine/lib/sendLobbyDataBuffer');

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
  const onDebug = options.onDebug || console.debug;
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
    client.pinged = false;

    client.on('pong', () => {
      onDebug(`Received pong event from client ${client.state.ip}`);
      client.isAlive = true;
      client.pinged = true;
    });

    client.on('error', (error) => {
      onClientError(error);

      // Try to send a generic error to the client
      try {
        const errorBuffer = Buffer.allocUnsafe(2);
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
        execCommand({ server, client, data, onGameMessage: options.onGameMessage });
      } catch (err) {
        onClientError(err);

        // Try to send a generic error to the client
        try {
          const errorBuffer = Buffer.allocUnsafe(2);
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

    // Send the initial event "lobby_data"
    autoReconnectPlayers && sendLobbyDataBuffer({ client });
  });

  attachServerListeners({ server, options });

  server.on('error', options.onServerError || console.error);
};
