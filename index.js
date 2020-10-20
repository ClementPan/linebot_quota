// basic setting
const line = require('@line/bot-sdk');
const { default: Axios } = require('axios');
const express = require('express');

//////////////// mysql query functions  ////////////////
const query = require('./mysql.js');

//////////////// event responses functions  ////////////////
const responses = require('./responses.js')

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create Express app
const app = express();

// require res_router
const router = require('./res_router/res_router.js')

// register a webhook handler with middleware
app.post('/', line.middleware(config), (req, res) => {
  Promise
    // deal with each event
    .all(req.body.events.map(router))
    .then((result) => {
      res.json(result)
    })
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[line chatbot: PENGUIN IS LISENTING on ${port}]`);
});