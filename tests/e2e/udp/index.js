const { UdpClient, EVENT } = require('./lib/client');
const { Lobby } = require('./lib/lobby');

const udpClient = new UdpClient();
const lobby = new Lobby(udpClient);

udpClient.listen('localhost', 8080, () => {
  console.log();
  console.log(`Connected to the UDP server ${udpClient.address}:${udpClient.port}`);

  udpClient.onEvent(EVENT.lobby_join, (err) => {
    if (err && err !== 3) return console.error('ERROR while joining a lobby:', err);
    if (err === 3) {
      // No lobbies found, just create a new one
      return lobby.create('Lobby', 2, 'P1');
    }
    console.log(udpClient.lobbyId, udpClient.adminId, udpClient.playerId, udpClient.playerName, udpClient.players, udpClient.playersMap);
  });

  lobby.joinAuto('P2');
});
