let mongoose = require('mongoose');

let Publisher = mongoose.Schema({
  Name: String,  
}, { collection: 'publisher' });

require('../helpers/mongoose-plugins')(Publisher);
module.exports = mongoose.model('publisher', Publisher);