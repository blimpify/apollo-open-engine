class StreamHelper {
  /**
   * Takes an Readable Stream and returns a buffer
   * @param stream<Readable>
   * @returns {Promise<Buffer>}
   */
  static streamToBuffer (stream) {
    return new Promise((resolve, reject) => {
      let buffers = [];
      stream.on('error', reject);
      stream.on('data', (data) => buffers.push(data));
      stream.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }
}

module.exports = {
  streamToBuffer: StreamHelper.streamToBuffer
};