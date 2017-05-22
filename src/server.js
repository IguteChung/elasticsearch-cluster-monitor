import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './app';
import template from './template';
import fetch from 'node-fetch';
import esHost from './config.js';

const server = express();

server.use('/assets', express.static('assets'));

server.get('/', (req, res) => {
  fetch(`${esHost()}/_cluster/state?pretty`)
    .then(resp => resp.json())
    .then(json => {
      const appString = renderToString(<App {...json}/>);

      res.send(template({
        body: appString,
        title: 'Elasticsearch cluster monitor'
      }));
    })
    .catch(err => res.status(500).send({ error: `Something wrong! ${err}` }));
});

server.listen(8080);
console.log('start serving on port 8080');
