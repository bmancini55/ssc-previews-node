let mongoose = require('mongoose');
let melpers  = require('../helpers/mongoose');

let Series = mongoose.Schema({
  _id: String,
  name: String,  
});

Series.plugin(melpers);
module.exports = mongoose.model('series', Series);