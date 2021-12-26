const { start: startWs } = require('./ws');
const { start: startUdp } = require('./udp');

module.exports = {
  ws: startWs,
  udp: startUdp
};
