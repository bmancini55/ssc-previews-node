let util = require('util');
let events = require('events');
let Bluebird = require('bluebird');
let MongoDB = Bluebird.promisifyAll(require('mongodb'));


function MongoDBInstance(config) {
  events.EventEmitter.call(this);

  if(!config || !config.connection) 
    throw new Error('Config requires connection property');

  this.config = config;  
  this.db = null;
}
util.inherits(MongoDBInstance, events.EventEmitter);

MongoDBInstance.prototype.connect = function connect() {
  MongoDB.connect(this.config.connection, (err, db) => {    
    if (err) this.emit('error', err);
    else { 
      this.db = db;
      this.emit('open', db);
    }
  });
};

MongoDBInstance.prototype.disconnect = function disconnect() {
  this.db.close((err, result) => {
    if(err) this.emit('error', err);
    else this.emit('close');
  });
};

module.exports = new MongoDBInstance(require('../../config').mongodb);