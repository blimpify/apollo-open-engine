const express = require('express');
const router = express.Router();
const Trace = require('./controller/trace');

router.post('/api/ingress/traces', Trace.capture);

module.exports = router;