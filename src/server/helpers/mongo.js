let mongoose = require('mongoose');
let config = require('../../config');

mongoose.connect(config.mongo.connection);

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('Mongo connected');
});

module.exports = db;