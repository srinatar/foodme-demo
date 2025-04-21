//var PORT = process.env.PORT && parseInt(process.env.PORT, 10) || 3000;
var PORT = 3001;
var STATIC_DIR = __dirname + '/../app';
var TEST_DIR = __dirname + '/../test';
var DATA_FILE = __dirname + '/data/restaurants.json';
var VIDEOS_FILE = __dirname + '/data/videos.json';
require('dotenv').config()

require('./index').start(PORT, STATIC_DIR, DATA_FILE, VIDEOS_FILE, TEST_DIR);
