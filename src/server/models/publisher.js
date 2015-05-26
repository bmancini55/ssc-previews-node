let mongoose = require('mongoose');
let melpers  = require('../helpers/mongoose');

let Publisher = mongoose.Schema({
  name: String,  
});

Publisher.plugin(melpers);
module.exports = mongoose.model('publisher', Publisher);