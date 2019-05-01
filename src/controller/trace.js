const zlib = require("zlib");
const {
  FullTracesReport
} = require('apollo-engine-reporting-protobuf');

/**
 * Parse based on Apollo Server reporting
 * https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/agent.ts
 */

/**
 * Takes an Readable Stream and returns a buffer
 * @param stream<Readable>
 * @returns {Promise<Buffer>}
 */
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    let buffers = [];
    stream.on('error', reject);
    stream.on('data', (data) => buffers.push(data));
    stream.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

/**
 * This class will capture and handle request from apollo server
 * @class Trace
 */
class Trace {
  /**
   * Capture Method
   * @function
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static capture (req, res, next) {
    const gunzip = zlib.createGunzip();
    streamToBuffer(req.pipe(gunzip))
      .then(data => {
        const decoded = FullTracesReport.decode(data);
        console.log(decoded);
        res.json({
          message: 'received data successfully'
        });
      })
      .catch(err => {
        next(err);
      });
  }
}

module.exports = Trace;