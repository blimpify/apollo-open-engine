const { readFileSync } = require('fs');
const { resolve } = require('path');

const {
  trace,
  traces,
  tracesByQueryId,
  tracesDistinctByQueryId,
  GroupStatistics,
  GroupByQueryId,
  TraceHeaderAggregation
} = require('./dao/mongo/dao');

const typeDefs = readFileSync(resolve(__dirname, '../schema.graphql'), 'utf8');

const resolvers = {
  Query: {
    traces,
    trace,
    tracesByQueryId,
    tracesDistinctByQueryId,
  },
  GroupStatistics,
  GroupByQueryId,
  TraceHeaderAggregation
};

module.exports = {
  typeDefs,
  resolvers
};