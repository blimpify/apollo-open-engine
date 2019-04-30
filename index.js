#!/usr/bin/env node
'use strict';

const zlib = require("zlib");
const express = require('express');
const app = express();

/**
 * WIP
 * reverse https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/agent.ts
 */

app.post('/api/ingress/traces', (req, res) => {
  let rawBody = '';
  const gunzip = zlib.createGunzip();
  req.pipe(gunzip);

  gunzip.on('data', function (data) {
    // decompression chunk ready, add it to the buffer
    rawBody += data;

  });

  gunzip.on("end", function () {
    zlib.gunzip(rawBody, (err, data) => {
      console.log(err, data)
    })
    // response and decompression complete, join the buffer and return
    console.log(rawBody)

  });

  gunzip.on("error", function (err) {
    console.log(err);
  });
});

app.all('*', (req, res, next) => {
  console.log(req.path);
  res.end();
});

app.listen(8000, function () {
  console.log('Example app listening on port 8000!');
});