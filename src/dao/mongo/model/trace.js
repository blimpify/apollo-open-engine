const { Schema, model } = require('mongoose');


const ChildSchema = new Schema({
  index: Number,
  depth: Number,
  fieldName: String,
  type: { type: String },
  startTime: String,
  endTime: String
});

const TraceSchema = new Schema({
  header: {
    hostname: String,
    agentVersion: String,
    runtimeVersion: String,
    uname: String,
    schemaTag: String,
    schemaHash: String
  },
  queryId: {
    type: String,
    index: true,
  },
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
  clientReferenceId: String,
  durationNs: Number,
  child: [ChildSchema]
});

const Child = model('Child', ChildSchema);
const Trace = model('Trace', TraceSchema);

module.exports = {
  TraceSchema,
  Trace,
  ChildSchema,
  Child
};
