const { errors } = require('../lib/errors');

/**
 * Get the ban list
 */
exports.handler = ({ client, state, lobby, commandId, sendConfirmWithError, udpHeaderSize, appendUdpHeader }) => {
  // Lobby check
  if (!lobby) return sendConfirmWithError(errors.lobbyNotFound);
  if (lobby.adminId !== state.id) return sendConfirmWithError(errors.unauthorized);

  // Build the response
  let size = 0;
  let count = 0;
  for (const ipHash in lobby.bansByIp) {
    size += ipHash.length + lobby.bansByIp[ipHash].length + 2; /* 2 null chars */
    count++;
  }

  const response = Buffer.allocUnsafe(6 + size + udpHeaderSize);
  response[0] = commandId;
  response[1] = errors.noError;
  response.writeUInt16LE(count, 2);
  let offset = 4;
  for (const ipHash in lobby.bansByIp) {
    /* IP Hash */
    response.write(ipHash + '\0', offset);
    offset += ipHash.length + 1;

    /* Player Username */
    const playerName = lobby.bansByIp[ipHash];
    response.write(playerName + '\0', offset);
    offset += playerName.length + 1;
  }

  if (udpHeaderSize) appendUdpHeader(response);

  // Send the response
  client.send(response);
};

/**
interface Input {
  commandId           u8
  newAdminId          u8
}

interface SenderOutput {
  commandId           u8
  error               u8
  bansCount           u16
  [
    ipHash            string
    playerName        string
  ]
}
*/
