exports.createNetBuffer = (client, sendBroadcast, udpHeaderSize, size, reliable) => {
  const length = size + udpHeaderSize;
  const buffer = Buffer.allocUnsafe(length);
  let offset = 0;

  // Inject the UDP header
  if (udpHeaderSize) {
    buffer.writeUInt32LE(client.serverPacketId++, length - 5);
    buffer.writeUInt8(reliable, length - 1);
  }

  return {
    writeU8(value) {
      buffer[offset++] = value;
    },

    writeU32(value) {
      buffer.writeUInt32LE(value, offset);
      offset += 4;
    },

    writeString(value) {
      buffer.write(value + '\0', offset);
      offset += value.length + 1;
    },

    readU8() {
      return buffer[offset++];
    },

    readU32() {
      offset += 4;
      return buffer.readUInt32LE(offset - 4);
    },

    readString() {
      const value = buffer.slice(offset, buffer.indexOf(0, offset)).toString();
      offset += value.length + 1;
      return value;
    },

    send() {
      client.send(buffer);
    },

    broadcast() {
      sendBroadcast(buffer);
    },

    debug() {
      console.debug(JSON.stringify(buffer.reduce((array, byte) => ([...array, byte]), [])));
    }
  };
};
