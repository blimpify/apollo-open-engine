#!/usr/bin/env node
'use strict';


const express = require('express');
const app = express();
const pino = require('pino');
const  logger = pino({
  useLevelLabels: true,
  serializers: {
    err: pino.stdSerializers.err
  }
});

app.use(require('./src/router'));

app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({
    message: 'Something broke!'
  });
});

process.on('uncaughtException', pino.final(logger, (err, finalLogger) => {
  finalLogger.error(err, 'uncaughtException');
  process.exit(1);
}));

process.on('unhandledRejection', pino.final(logger, (err, finalLogger) => {
  finalLogger.error(err, 'unhandledRejection');
  process.exit(1);
}));

const port = process.env.PORT || 8000;
app.listen(port, () => {
  logger.info('App listening on port %s', port);
});