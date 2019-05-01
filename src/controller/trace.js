const zlib = require("zlib");
const {
  FullTracesReport
} = require('apollo-engine-reporting-protobuf');
const { streamToBuffer } = require('../lib/stream-helper');

/**
 * Parse based on Apollo Server reporting
 * https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/agent.ts
 */

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
        req.log.trace(decoded, 'successfully parsed trace');

        //TODO store trace in db
        //TODO only respond success if trace stored correct
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