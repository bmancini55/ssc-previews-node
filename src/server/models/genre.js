let mongoose = require('mongoose');
let melpers  = require('../helpers/mongoose');

let Genre = mongoose.Schema({
  Name: String,  
}, { collection: 'genre' });

Genre.plugin(melpers);
module.exports = mongoose.model('genre', Genre);