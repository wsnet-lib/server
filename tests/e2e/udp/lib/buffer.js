let packetId = 0;

const appendUdpHeader = (buffer, reliable = 1) => {
  buffer.writeUInt32LE(packetId++, buffer.byteLength - 5);
  buffer[5] = reliable;
};

const logBuffer = exports.logBuffer = (buffer) => {
  return buffer.reduce((array, byte) => [...array, byte], []);
};

exports.NetBuffer = class NetBuffer {
  constructor(sizeOrBuffer) {
    this.offset = 0;

    if (Number.isInteger(sizeOrBuffer)) {
      this.buffer = Buffer.allocUnsafe(sizeOrBuffer);
    } else {
      this.buffer = sizeOrBuffer;
    }
  }

  writeU8(value) {
    this.buffer[this.offset++] = value;
  }

  writeU32(value) {
    this.buffer.writeUInt32LE(value, this.offset);
    this.offset += 4;
  }

  writeString(value) {
    this.buffer.write(value + '\0', this.offset);
    this.offset += value.length + 1;
  }

  readU8() {
    return this.buffer[this.offset++];
  }

  readU32() {
    this.offset += 4;
    return this.buffer.readUInt32LE(this.offset - 4);
  }

  readString() {
    const value = this.buffer.slice(this.offset, this.buffer.indexOf(0, this.offset)).toString();
    this.offset += value.length + 1;
    return value;
  }

  send(server, reliable = 1) {
    appendUdpHeader(this.buffer, reliable);

    const cmdId = this.buffer[0];
    if (cmdId !== 24 && cmdId !== 25) {
      console.debug('Sending..', JSON.stringify(logBuffer(this.buffer)));
    }

    server.send(this.buffer);
  }

  debug() {
    console.debug(JSON.stringify(this.buffer.reduce((array, byte) => ([...array, byte]), [])));
  }
};
