let mongoose = require('mongoose');
let melpers  = require('../helpers/mongoose');

let Genre = mongoose.Schema({
  _id: String,
  name: String,  
});

Genre.plugin(melpers);
module.exports = mongoose.model('genre', Genre);