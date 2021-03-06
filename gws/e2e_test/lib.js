/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const commands = {
  error: 0,
  game_message: 1,
  lobby_list: 2,
  lobby_create: 3,
  lobby_join: 4,
  lobby_join_auto: 5,
  lobby_player_joined: 6,
  lobby_leave: 7,
  lobby_player_left: 8,
  lobby_transfer: 9,
  lobby_transfer_changed: 10,
  lobby_allow_join: 11,
  lobby_allow_join_changed: 12,
  lobby_max_players: 13,
  lobby_max_players_changed: 14,
  lobby_kick: 15,
  lobby_player_kicked: 16,
  lobby_username: 17,
  lobby_player_username: 18,
  lobby_bans: 19,
  lobby_unban: 20,
  lobby_password: 21
};

const errors = [
  'noError',
  'commandNotFound',
  'playerNotFound',
  'lobbyNotFound',
  'unauthorized',
  'wrongPassword',
  'maxLobbyPlayers',
  'inputValidationFailed',
  'alreadyInLobby',
  'serverError'
];

function string(str) {
  const array = new Array(str.length + 1);
  for (let i = 0, len = str.length; i < len; i++) {
    array[i] = str.charCodeAt(i);
  }
  array[array.length - 1] = 0;
  return array;
}

function arrayToString(array) {
  let str = '';
  for (let i = 0, len = array.length; i < len; i++) {
    str += String.fromCharCode(array[i]);
  }
  return str;
}

function u32(num) {
  const buff = new ArrayBuffer(4);
  new DataView(buff).setUint32(0, num);
  return Array.from(new Uint8Array(buff));
}

function u32ToNum(array) {
  return new DataView(new Uint32Array(array).buffer).getUint32(0, true);
}

function decodeMessage(data) {
  const dv = new DataView(data);
  const array = new Array(data.byteLength);
  for (let i = 0, len = array.length; i < len; i++) {
    array[i] = dv.getUint8(i);
  }
  return array;
}

function sendBuffer(ws, ...array) {
  const buffer = new ArrayBuffer(array.length);
  const view = new Uint8Array(buffer);
  console.log('Sent buffer:', array);
  array.forEach((elem, idx) => {
    view[idx] = elem;
  });
  ws.send(view);
  console.log('---');
}

function time() {
  return new Date() - timeStart + 'ms';
}

function error(errorId) {
  console.log(`%cError received in ${time()}: ${errors[errorId]}`, 'color: red');
}
