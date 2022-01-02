const { commandIds } = require('../../../../engine/lib/commandIds');
const { NetBuffer } = require('./buffer');

const udpHeaderSize = 5;

exports.Lobby = class Lobby {
  constructor({ server }) {
    this.server = server;
  }

  join(lobbyId, username, password = '') {
    const buffer = new NetBuffer(1 + username.length + password.length + 2 + udpHeaderSize);
    buffer.writeU8(commandIds.lobby_join_auto);
    buffer.writeString(username);
    buffer.writeU8(lobbyId);
    buffer.writeString(password);
    buffer.send(this.server);
  }

  joinAuto(username, dateSort = 0, playersCountSort = 0) {
    const buffer = new NetBuffer(3 + username.length + 1 + udpHeaderSize);
    buffer.writeU8(commandIds.lobby_join_auto);
    buffer.writeU8(dateSort);
    buffer.writeU8(playersCountSort);
    buffer.writeString(username);
    buffer.send(this.server);
  }

  create(lobby, maxPlayers, username, password = '') {
    const buffer = new NetBuffer(2 + lobby.length + username.length + password.length + 3 + udpHeaderSize);
    buffer.writeU8(commandIds.lobby_create);
    buffer.writeString(lobby);
    buffer.writeU8(maxPlayers);
    buffer.writeString(username);
    buffer.writeString(password);
    buffer.send(this.server);
  }

  list() {
    const buffer = new NetBuffer(1 + udpHeaderSize);
    buffer.writeU8(commandIds.lobby_list);
    buffer.send(this.server);
  }
};
