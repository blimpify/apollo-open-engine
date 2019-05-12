const { Schema } = require('mongoose');

const TraceSchema = new Schema({
  queryId: String,
  endTime: {
    seconds: String,
    nanos: Number,
  },
  startTime: {
    seconds: String,
    nanos: Number,
  },
  clientName: String,
  clientVersion: String,
  http: {
    method: String,
    requestHeaders: {
      type: Map,
      of: String
    }
  },
  durationNs: String,
  root: [
    {
      depth: Number,
      index: Number,
      fieldName: String,
      type: String,
      startTime: String,
      endTime: String
    }
  ],
  clientReferenceId: String
});

const ApolloTraceSchema = new Schema({
  header: {
    hostname: String,
    agentVersion: String,
    runtimeVersion: String,
    uname: String,
    schemaTag: String,
    schemaHash: String
  },
  tracesPerQuery: [TraceSchema]
});

module.exports = {
  ApolloTraceSchema,
  TraceSchema
};
