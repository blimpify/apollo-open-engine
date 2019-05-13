#!/usr/bin/env node
'use strict';


const express = require('express');
const pino = require('pino');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
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

const mongo_url = process.env.MONGO_URL || 'mongodb://localhost:27017/apollo';
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.connect(mongo_url, {useNewUrlParser: true});
mongoose.connection.once('open', () => logger.info(`Connected to mongo at ${mongo_url}`));

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

/**
 * Setup Apollo Server
 */

const { resolvers, typeDefs } = require('./src/resolver');

const apolloServer = new ApolloServer({
  resolvers,
  typeDefs,
  tracing: true,
  playground: {
    props: {
      endpoint: '/graphql'
    }
  }
});

apolloServer.applyMiddleware({ app });

/**
 * Error Handler
 */

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