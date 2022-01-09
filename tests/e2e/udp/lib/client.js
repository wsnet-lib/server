const udp = require('dgram');
const { commandIds } = require('../../../../engine/lib/commandIds');
const { NetBuffer, logBuffer } = require('./buffer');

const udpHeaderSize = 5;

const EVENT = exports.EVENT = {
  connection: 0,
  connection_close: 1,
  lobby_data: 2,
  lobby_create: 3,
  lobby_join: 4,
  lobby_leave: 5,
  lobby_allow_join: 6,
  lobby_get_banned: 7,
  lobby_get_list: 8,
  lobby_max_players: 9,
  lobby_password: 10,
  lobby_transfer: 11,
  lobby_unban: 12,
  player_join: 13,
  player_leave: 14,
  player_kickban: 15,
  player_username: 16
};

exports.UdpClient = class UdpClient {
  constructor() {
    this.server = udp.createSocket('udp4');
    this.lobbyId = null;
    this.adminId = null;
    this.playerId = null;
    this.playerName = null;
    this.players = [];
    this.playersMap = {};
    this.__lastServerPong = +new Date();
    this.__messagesCallbacks = {};

    this.__events = Object.values(commandIds).reduce((map, cmdId) => {
      map[cmdId] = () => { };
      return map;
    }, {});

    this.__setupEvents();
  }

  listen(address, port, callback) {
    this.address = address;
    this.port = port;

    this.server.connect(port, address, () => {
      setTimeout(() => {
        this.__ping();
        callback && callback();
      }, 500);
    });
  }

  onEvent(eventId, callback) {
    this.__events[eventId] = callback;
  }

  onMessage(eventId, callback) {
    this.__messagesCallbacks[eventId] = callback;
  }

  __ping() {
    if (+new Date() - this.__lastServerPong > 10000) {
      return console.log('ERROR: Connection to the server lost');
    }
    const buffer = new NetBuffer(1 + udpHeaderSize);
    buffer.writeU8(commandIds.ping);
    buffer.send(this.server, 0);
    setTimeout(() => this.__ping(), 750);
  }

  __setupEvents() {
    const { server } = this;

    server.on('message', (packet) => {
      const packetBuffer = new NetBuffer(packet);
      let errorId;
      let playersCount;
      let lobbies;
      let endOffset;

      const cmdId = packetBuffer.readU8();
      if (cmdId !== 24 && cmdId !== 25) {
        console.log('Incoming packet:', JSON.stringify(logBuffer(packet)));
      }

      // If the server message is reliable, send back the ack
      const reliable = packet[packet.byteLength - 1];
      if (reliable === 2) {
        const replyBuffer = Buffer.allocUnsafe(packet.byteLength);
        packet.copy(replyBuffer, 0, 0, packet.byteLength - 1);
        replyBuffer[0] = commandIds.ack;
        replyBuffer[packet.byteLength - 1] = 0;
        server.send(replyBuffer);
      }

      switch (cmdId) {
        case commandIds.error:
          console.error('Received error:', packetBuffer.readU8());
          break;

        case commandIds.ping:
          this.__lastServerPong = +new Date();
          break;

        case commandIds.lobby_join:
          errorId = packetBuffer.readU8();
          if (errorId) {
            return this.__events[EVENT.lobby_join](errorId);
          }

          this.lobbyId = packetBuffer.readU32();
          this.adminId = packetBuffer.readU8();
          this.playerId = packetBuffer.readU8();
          playersCount = packetBuffer.readU8();

          for (let i = 0; i < playersCount; i++) {
            const player = {
              id: packetBuffer.readU8(),
              name: packetBuffer.readString()
            };
            this.players.push(player);
            this.playersMap[player.id] = player;

            if (player.id === this.playerId) {
              this.playerName = player.name;
            }
          }

          this.__events[EVENT.lobby_join]();
          break;

        case commandIds.lobby_list:
          lobbies = [];
          endOffset = packet.byteLength - udpHeaderSize;

          while (packetBuffer.offset < endOffset) {
            lobbies.push({
              id: packetBuffer.readU32(),
              name: packetBuffer.readString(),
              players: packetBuffer.readU8(),
              max_players: packetBuffer.readU8(),
              has_password: packetBuffer.readU8()
            });
          }

          this.__events[EVENT.lobby_get_list](null, lobbies);
          break;
      }
    });
  }
};
