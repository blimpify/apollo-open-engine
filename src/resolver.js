const { readFileSync } = require('fs');
const { resolve } = require('path');
const { Trace } = require('./dao/mongo/model/trace');

const typeDefs = readFileSync(resolve(__dirname, '../schema.graphql'), 'utf8');

const resolvers = {
  Query: {
    traces: async (parent, args) => await Trace.find(),
    trace: async (parent, { id }) => await Trace.findById(id),
  },
};

module.exports = {
  typeDefs,
  resolvers
};