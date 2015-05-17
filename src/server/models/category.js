let mongoose = require('mongoose');

let Category = mongoose.Schema({
  Name: String,  
}, { collection: 'category' });

require('../helpers/mongoose-plugins')(Category);
module.exports = mongoose.model('category', Category);