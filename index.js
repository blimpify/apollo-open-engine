#!/usr/bin/env node
'use strict';


const express = require('express');
const pino = require('pino');
const  logger = pino({
  useLevelLabels: true,
  // Available 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'.
  level: process.env.LOG_LEVEL || 'info',
  serializers: {
    err: pino.stdSerializers.err
  }
});
const httpLogger = require('pino-http')({
  logger
});

/**
 * Setup Express App
 * @type {app}
 */
const app = express();

/**
 * Setup Express Logger
 */
app.use(httpLogger);

/**
 * Setup Router
 */
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

module.exports = app;