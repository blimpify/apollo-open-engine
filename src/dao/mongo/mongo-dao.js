const { model } = require('mongoose');
const { TraceSchema } = require('./model/trace');
const { flattenChild } = require('../../lib/trace-helper');

const TraceModel = model('Trace', TraceSchema);

class MongoDao {
  static storeTrace (decoded) {
    let tracesPerQuery = [];

    Object.keys(decoded.tracesPerQuery).map(key => {
      // save individual traces
      let traces = decoded.tracesPerQuery[key].trace;
      traces.map(trace => {
        let requestHeaders = {};
        Object.keys(trace.http.requestHeaders).map(header => {
          requestHeaders[header] = trace.http.requestHeaders[header].value[0];
        });

        let http = {
          method: trace.http.method,
          requestHeaders
        };

        let child = flattenChild(trace.root);

        let traceModel = new TraceModel({
          header: decoded.header,
          queryId: key,
          endTime: trace.endTime,
          startTime: trace.startTime,
          clientName: trace.clientName,
          clientVersion: trace.clientVersion,
          durationNs: trace.durationNs,
          http,
          child
        });

        tracesPerQuery.push(traceModel.save());
      });
    });

    return Promise.all(tracesPerQuery)
  }
}

module.exports = {
  storeTrace: MongoDao.storeTrace
};
