const { readFileSync } = require('fs');
const { resolve } = require('path');
const { Trace } = require('./dao/mongo/model/trace');
const { trace, traces, tracesByQueryId, tracesGroupedByQueryIds } = require('./dao/mongo/dao');

const typeDefs = readFileSync(resolve(__dirname, '../schema.graphql'), 'utf8');

const resolvers = {
  Query: {
    traces,
    trace,
    tracesByQueryId,
    tracesGroupedByQueryIds,
  },
  GroupStatistics: {
    durationNs: async (trace) => {
      return {
        avg: trace.avgDurationNs,
        min: trace.minDurationNs,
        max: trace.maxDurationNs,
      }
    }
  },
  GroupByQueryId: {
    queryId: async (trace) => {
      return await trace._id
    },
    statistics: async (trace) => {
      return trace
    },
    traces: async (trace) => {
      return await Trace.find({queryId: trace.queryId})
    },
  }
}

module.exports = {
  typeDefs,
  resolvers
};