const { Trace } = require('./model/trace');
const { flattenChild } = require('../../lib/trace-helper');

async function traceHeaderAggregateByQueryId () {
  return await Trace.aggregate([{
    $group: {
      _id: {
        queryId: '# testquery test{chirpByAccountId(id:""){id}chirps{id}chirps{text}}',
        hostname: "$header.hostname",
        agentVersion: "$header.agentVersion",
        runtimeVersion: "$header.runtimeVersion",
        uname: "$header.uname",
        schemaTag: "$header.schemaTag",
        schemaHash: "$header.schemaHash",
      },
      count: {
        $sum: 1
      },
    }
  }, {
    $group: {
      _id: null,
      hostname: {
        "$push": {
          "k": "$_id.hostname",
          "v": "$count"
        }
      },
      agentVersion: {
        "$push": {
          "k": "$_id.agentVersion",
          "v": "$count"
        }
      },
      runtimeVersion: {
        "$push": {
          "k": "$_id.runtimeVersion",
          "v": "$count"
        }
      },
      uname: {
        "$push": {
          "k": "$_id.uname",
          "v": "$count"
        }
      },
      schemaTag: {
        "$push": {
          "k": "$_id.schemaTag",
          "v": "$count"
        }
      },
      schemaHash: {
        "$push": {
          "k": "$_id.schemaHash",
          "v": "$count"
        }
      }
    }
  }, {
    $project: {
      hostnames: {
        total: {
          $sum: '$hostname.v'
        },
        values: {
          "$arrayToObject": "$hostname"
        },
      },
      agentVersions: {
        total: {
          $sum: '$agentVersion.v'
        },
        values: {
          "$arrayToObject": "$agentVersion"
        },
      },
      runtimeVersions: {
        total: {
          $sum: '$runtimeVersion.v'
        },
        values: {
          "$arrayToObject": "$runtimeVersion"
        },
      },
      unames: {
        total: {
          $sum: '$uname.v'
        },
        values: {
          "$arrayToObject": "$uname"
        },
      },
      schemaTags: {
        total: {
          $sum: '$schemaTag.v'
        },
        values: {
          "$arrayToObject": "$schemaTag"
        },
      },
      schemaHashes: {
        total: {
          $sum: '$schemaHash.v'
        },
        values: {
          "$arrayToObject": "$schemaHash"
        },
      },
    }
  }]);
}

async function tracesDistinctByQueryId (parent, { skip = 0, limit = 15 }) {
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

function prepareValueStringAggregation(header) {
  return Object.keys(header.values).map((key, index) => {
    return {
      value: key,
      count: header.values[key],
      percentage: header.values[key] / header.total * 100
    }
  })
}

const TraceHeaderAggregation = {
  hostname: async (headerStatistics) => {
    return prepareValueStringAggregation(headerStatistics[0].hostnames);
  },
  agentVersion: async (headerStatistics) => {
    return prepareValueStringAggregation(headerStatistics[0].agentVersions);
  },
  runtimeVersion: async (headerStatistics) => {
    return prepareValueStringAggregation(headerStatistics[0].runtimeVersions);
  },
  uname: async (headerStatistics) => {
    return prepareValueStringAggregation(headerStatistics[0].unames);
  },
  schemaTag: async (headerStatistics) => {
    return prepareValueStringAggregation(headerStatistics[0].schemaTags);
  },
  schemaHash: async (headerStatistics) => {
    return prepareValueStringAggregation(headerStatistics[0].schemaHashes);
  }
};

const GroupStatistics = {
  header: async (trace) => {
    return await traceHeaderAggregateByQueryId(trace.queryId);
  },
  durationNs: async (trace) => {
    return {
      avg: trace.avgDurationNs,
      min: trace.minDurationNs,
      max: trace.maxDurationNs,
    };
  }
};

const GroupByQueryId = {
  queryId: async (trace) => {
    return await trace._id;
  },
  statistics: async (trace) => {
    return trace;
  },
  traces: async (trace) => {
    return await Trace.find({queryId: trace.queryId});
  },
};

module.exports = {
  storeTrace,
  tracesDistinctByQueryId,
  tracesByQueryId,
  trace,
  traces,
  GroupStatistics,
  GroupByQueryId,
  TraceHeaderAggregation
};
