const { model } = require('mongoose');
const { TraceSchema } = require('./model/trace');

const TraceModel = model('Trace', TraceSchema);



function flattenChild(root) {
  let children = [];
  function recursive(child) {
    child.map((c, i) => {
      let tmp = {};

      if (!c.depth && !(c.depth === 0)) {
        tmp.depth = 0;
      } else {
        tmp.depth = c.depth + 1;
      }

      tmp.index = i;
      tmp.fieldName = c.fieldName;
      tmp.type = c.type;
      tmp.startTime = c.startTime.toString();
      tmp.endTime = c.endTime.toString();

      children.push(tmp);

      if (c.child) {
        c.child.map(subChildren => {
          subChildren.child.forEach(subChild => {
            subChild.depth = tmp.depth
          });
          recursive(subChildren.child)
        })
      }
    });
  }

  recursive(root.child);
  return children;
}

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
