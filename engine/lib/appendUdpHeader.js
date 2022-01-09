/**
 * Append the UDP header with message ID and reliable flag to the original buffer
 * @param {Client} client
 * @param {Buffer} buffer
 * @param {Integer} [reliable] Reliable flag
 */
exports.appendUdpHeader = (client, buffer, reliable = 2) => {
  const { byteLength } = buffer;
  buffer.writeUInt32LE(client.serverPacketId++, byteLength - 5);
  buffer.writeUInt8(reliable, byteLength - 1);
};
