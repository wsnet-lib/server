const Quicksort = require('optimized-quicksort');
const { appendUdpHeader } = require('../lib/appendUdpHeader');
const { commandIds } = require('../lib/commandIds');
const { resetLobbyState } = require('./player');

/**
 * interface Lobby {
 *  id: Number
 *  name: String
 *  adminId: Number
 *  freeIds: Number[]
 *  players: Player[]
 *  maxPlayers: Number
 *  password?: String
 *  allowJoin: Boolean
 *  data: LobbyData
 *  bansByIp: Object<Bans>
 *  isBanned: (state: State): Boolean => {}
 * }
 */

/** Lobby list */
const lobbies = exports.lobbies = {};

/** Lobby Increment ID */
let lobbyAutoIncrement = 0;

/**
 * Create a lobby, if not already in a lobby
 *
 * @param {String} lobbyName
 * @param {Number} maxPlayers
 * @param {WebSocket.Client} client
 * @param {String} password
 *
 * @return {Number} Lobby
 */
exports.createLobby = (lobbyName, maxPlayers, client, password) => {
  const id = lobbyAutoIncrement++;

  // Create the available IDs
  const freeIds = [];
  for (let i = 254; i >= 0; i--) freeIds[i] = i;
  freeIds.shift();

  // Push the lobby
  const lobby = {
    id,
    name: lobbyName,
    players: [client],
    adminId: 0,
    freeIds,
    maxPlayers,
    password,
    allowJoin: true,
    createdAt: new Date(),
    data: {},
    bansByIp: {},
    isBanned: (ipHash) => lobby.bansByIp[ipHash]
  };
  lobbies[id] = lobby;
  return lobby;
};

/**
   * Find a lobby based on the sort criteria
   *
   * @param {Boolean} dateSort (0=disabled, 1=asc, 2=desc)
   * @param {Boolean} maxPlayersSort (0=disabled, 1=asc, 2=desc)
   * @param {String} ip
   *
   * @return {Lobby}
   */
exports.findLobby = (dateSort, maxPlayersSort, ip) => {
  const lobbiesArray = Object.values(lobbies);

  // Sort the lobbies, if specified
  if (dateSort || maxPlayersSort) {
    Quicksort.sort(lobbiesArray, (a, b) => {
      const compareDate = dateSort === 1
        ? a.createdAt - b.createdAt
        : b.createdAt - a.createdAt;

      const compareMaxPlayers = maxPlayersSort === 1
        ? a.players.length - b.players.length
        : b.players.length - a.players.length;

      if (dateSort !== 0) {
        return maxPlayersSort === 0 ? compareDate : (compareDate || compareMaxPlayers);
      } else if (maxPlayersSort !== 0) {
        return dateSort === 0 ? compareMaxPlayers : (compareDate || compareMaxPlayers);
      }
    });
  }

  // Get the first lobby not fully and without a password
  return lobbiesArray.find(
    lobby => lobby.players.length < lobby.maxPlayers && !lobby.password && !lobby.isBanned(ip) && lobby.allowJoin
  );
};

/**
 * Handle the player disconnection
 * @param {Client} client
 * @param {Number} [udpHeaderSize]
 * @return {Boolean}
 */
exports.removePlayer = (client, udpHeaderSize) => {
  const { state } = client;
  const { lobby, id: playerId } = state;
  const { players } = lobby;
  const playerLobbyIdx = players.findIndex(player => player.state.id === playerId);
  if (playerLobbyIdx === -1) return false;

  // Remove the player from the lobby
  players.splice(playerLobbyIdx, 1);
  lobby.freeIds.push(playerId);

  let deletedLobby = false;

  // If this user was an admin, assign the admin to another player if any, or delete the lobby
  if (players.length) {
    if (lobby.adminId === playerId) {
      lobby.adminId = players[0].state.id;
    }
  } else {
    delete lobbies[lobby.id];
    deletedLobby = true;
  }

  // Broadcast the removed player to all the other lobby players
  if (!deletedLobby) {
    const response = Buffer.allocUnsafe(3 + udpHeaderSize);
    response[0] = commandIds.lobby_player_left;
    response[1] = playerId;
    response[2] = lobby.adminId;
    if (udpHeaderSize) appendUdpHeader(client, response);

    for (let i = 0, len = players.length; i < len; i++) {
      players[i].send(response);
    }
  }

  // Reset the player state
  resetLobbyState(state);
  return true;
};

/**
 * Unban the player from the lobby
 * @param {Lobby} lobby
 * @param {String} ipHash
 */
exports.unbanPlayer = (lobby, ipHash) => {
  delete lobby.bansByIp[ipHash];
};
