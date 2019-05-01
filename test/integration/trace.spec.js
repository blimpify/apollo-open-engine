const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../..');
const { readFileSync } = require('fs');
const { join } = require('path');

chai.use(chaiHttp);
chai.should();

describe("Capture Trace", () => {
  describe("POST /api/ingress/traces", () => {

    it("should get successfully parsed", (done) => {
      const chirp = readFileSync(join(__dirname, '../resources/chirp.gz'));
      chai.request(app)
        .post('/api/ingress/traces')
        .set('accept-encoding','gzip,deflate')
        .set('content-encoding','gzip')
        .set('user-agent','apollo-engine-reporting')
        .send(chirp)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    });
  });
});