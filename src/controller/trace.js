const zlib = require("zlib");
const {
  FullTracesReport
} = require('apollo-engine-reporting-protobuf');
const { streamToBuffer } = require('../lib/stream-helper');
const { storeTrace } = require('../dao/mongo/mongo-dao');

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
        storeTrace(decoded)
          .then(response => {
            return res.json({
              message: 'stored data successfully'
            });
          })
          .catch(err => {
            return next(err);
          });
      })
      .catch(err => {
        return next(err);
      });
  }
}

module.exports = Trace;