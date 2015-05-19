let mongoose = require('mongoose');
let melpers  = require('../helpers/mongoose');

let Publisher = mongoose.Schema({
  Name: String,  
}, { collection: 'publisher' });

Publisher.plugin(melpers);
module.exports = mongoose.model('publisher', Publisher);