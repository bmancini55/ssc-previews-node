let mongoose = require('mongoose');
let melpers  = require('../helpers/mongoose');

let Category = mongoose.Schema({
  Name: String,  
}, { collection: 'category' });

Category.plugin(melpers);
module.exports = mongoose.model('category', Category);