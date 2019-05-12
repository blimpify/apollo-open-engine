const { model } = require('mongoose');
const { TraceSchema, ApolloTraceSchema } = require('./model/trace');

const TraceModel = model('Trace', TraceSchema);
const ApolloTraceModel = model('ApolloTrace', ApolloTraceSchema);

class MongoDao {
  static storeTrace (decodedTrace) {
    return new Promise((resolve, reject) => {
      let apolloTraceModel = new ApolloTraceModel({
        header: decodedTrace.header
      });
      return resolve (decodedTrace);
    })
  }
}

module.exports = {
  storeTrace: MongoDao.storeTrace
};