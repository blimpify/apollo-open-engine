const { Trace } = require('./model/trace');
const { flattenChild } = require('../../lib/trace-helper');


async function tracesGroupedByQueryIds (parent, { skip = 0, limit = 15 }) {
  return await Trace.aggregate([
    {
      $group : {
        _id : "$queryId",
        count: { $sum: 1 },
        avgDurationNs: { $avg: "$durationNs" },
        minDurationNs: { $min: "$durationNs" },
        maxDurationNs: { $max: "$durationNs" },
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    }
  ]);
}

async function tracesByQueryId (parent, { queryId }) {
  return await Trace.find({queryId})
}

async function trace (parent, {
  id
}) {
  return await Trace.findById(id)
}

async function traces (parent, { skip = 0, limit = 15 }) {
  return await Trace.find().limit(limit).skip(skip)
}


function storeTrace (decoded) {
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

      let traceModel = new Trace({
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

module.exports = {
  storeTrace,
  tracesGroupedByQueryIds,
  tracesByQueryId,
  trace,
  traces
};
