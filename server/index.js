const newrelic = import('newrelic');

const express = require('express');
const logger = require('pino')();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const fs = require('fs');
const { setMaxIdleHTTPParsers } = require('http');

const RestaurantRecord = require('./model').Restaurant;
const MemoryStorage = require('./storage').Memory;

const API_URL = '/api/restaurant';
const API_URL_ID = API_URL + '/:id';
const API_URL_ORDER = '/api/order';
const API_URL_STATUS = '/api/status';
const API_URL_USER_VALIDATION = '/api/userValidation';
const VIDEOS_API_URL = '/api/videos';
const VIDEOS_API_URL_ID = '/api/videos/:id';

var removeMenuItems = function(restaurant) {
  var clone = {};

  Object.getOwnPropertyNames(restaurant).forEach(function(key) {
    if (key !== 'menuItems') {
      clone[key] = restaurant[key];
    }
  });

  return clone;
};

exports.start = function(PORT, STATIC_DIR, DATA_FILE, VIDEOS_FILE, TEST_DIR) {
  var app = express();
  var storage = new MemoryStorage();

  var videos = require(VIDEOS_FILE);

  // log requests
  app.use(morgan('combined'));

  // serve static files for demo client
  app.use(express.static(STATIC_DIR));

  // create application/json parser
  var jsonParser = bodyParser.json();

  // API
  app.get(API_URL, function(req, res, next) {
    //res.status(200).send(storage.getAll().map(removeMenuItems));

    var waitTime = Math.floor(Math.random() * 2000) + 100;
    setTimeout(function() {
      res.status(200).send(storage.getAll().map(removeMenuItems));
    }, (waitTime));

  });

  app.post(API_URL, function(req, res, next) {
    var restaurant = new RestaurantRecord(req.body);
    var errors = [];

    if (restaurant.validate(errors)) {
      storage.add(restaurant);
      return res.send(201, restaurant);
    }

    return res.status(400).send({ error: errors });
  });

  app.post(API_URL_ORDER, jsonParser, async function(req, res, next) {
    logger.info(req.body, 'checkout');
    // **************************************
    // Add custom instrumentation code here
    // **************************************
    function sleep(time){
      return new Promise((resolve,reject)=>{
        setTimeout(()=>{
          resolve(true)
        },time)
      }).then(val=>val)
    }
    //Artificially slow down Amex cards during 4 and 16 UTC
    var now = new Date();

    /*
    Disable the slow amex checkout

    //if(req.body.payment.type == 'amex' && (now.getHours() === 16 || now.getHours() === 4)) {
    if(req.body.payment.type == 'amex') {
      logger.info('sleeping 50s');
      const test = await sleep(50000);
      return res.status(201).send({ orderId: Date.now() });
    } else {
      const test = await sleep(1000);
      return res.status(201).send({ orderId: Date.now() });
    }
    */
    //return res.status(201).send({ orderId: Date.now() });
    var waitTime = Math.floor(Math.random() * 2000) + 100;
    setTimeout(function() {
      return res.status(201).send({ orderId: Date.now() });
    }, (waitTime));

  });

  app.get(API_URL_STATUS, jsonParser, function(req, res, next) {
    // **************************************
    // Add custom instrumentation code here
    // **************************************
    return res.status(200).send('success');
    /*
    var waitTime = Math.floor(Math.random() * 1000) + 100;
    setTimeout(function() {
      return res.status(200).send('success');
    }, (waitTime));
    */
  });

  app.get(API_URL_USER_VALIDATION, jsonParser, function(req, res, next) {
    // **************************************
    // Add custom instrumentation code here
    // **************************************
    const noon = 18 * 60 // 6pm UTC Time
    const one = 19 * 60 // 7pm UTC Time
    var now = new Date();
    var currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since Midnight

    if(currentTime > noon && currentTime < one){
      var wait = 40000; // Randomize up to 40 seconds wait time
    } else {
      var wait = 1000; // Randomize up to 1 second wait time
    }

    var waitTime = Math.floor(Math.random() * wait) + 100;
    setTimeout(function() {
      return res.status(200).send('success');
    }, (waitTime));

    /*
    if(currentTime > noon && currentTime < one){
      setTimeout(function() {
        return res.status(200).send('success');
      }, (slowWaitTime)); // 40 seconds wait time for slow card processing time
    } else {
      var fastWaitTime = Math.floor(Math.random() * 1000) + 100; // Random wait time for "normal" card processing time
      setTimeout(function() {
        return res.status(200).send('success');
      }, (fastWaitTime));
    }
    */

  });

  app.get(API_URL_ID, function(req, res, next) {
    var restaurant = storage.getById(req.params.id);

    if (restaurant) {
      return res.status(200).send(restaurant);
    }
    return res.status(400).send({ error: 'No restaurant with id "' + req.params.id + '"!' });

  });

  app.put(API_URL_ID, function(req, res, next) {
    var restaurant = storage.getById(req.params.id);
    var errors = [];

    if (restaurant) {
      restaurant.update(req.body);
      return res.status(200).send(restaurant);
      /*
      var waitTime = Math.floor(Math.random() * 1000) + 100;
      setTimeout(function() {
        return res.status(200).send(restaurant);
      }, (waitTime));
      */
    }

    restaurant = new RestaurantRecord(req.body);
    if (restaurant.validate(errors)) {
      storage.add(restaurant);
      return res.send(201, restaurant);
    }

    return res.send(400, { error: errors });
  });

  app.delete(API_URL_ID, function(req, res, next) {
    if (storage.deleteById(req.params.id)) {
      return res.send(204, null);
    }

    return res.send(400, { error: 'No restaurant with id "' + req.params.id + '"!' });
  });

  app.get(VIDEOS_API_URL, function(req, res, next) {
    res.status(200).send(videos.assets);
  });

  app.get(VIDEOS_API_URL_ID, function(req, res, next) {
    const videoId = parseInt(req.params.id, 10);
    const videoAsset = videos.assets.find((video) => video.assetId === videoId);

    if (videoAsset) {
      res.status(200).send(videoAsset);
    } else {
      res.status(404);
    }
  });

  // read the data from json and start the server
  fs.readFile(DATA_FILE, function(err, data) {
    JSON.parse(data).forEach(function(restaurant) {
      storage.add(new RestaurantRecord(restaurant));
    });

    app.listen(PORT, function() {
      console.log('Go to http://localhost:' + PORT + '/');
    });
  });

  // Windows and Node.js before 0.8.9 would crash
  // https://github.com/joyent/node/issues/1553
  try {
    process.on('SIGINT', function() {
      // save the storage back to the json file
      fs.writeFile(DATA_FILE, JSON.stringify(storage.getAll()), function() {
        process.exit(0);
      });
    });
  }
  catch (e) {}

};
