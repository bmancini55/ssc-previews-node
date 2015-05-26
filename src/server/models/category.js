let mongoose = require('mongoose');
let melpers  = require('../helpers/mongoose');

let Category = mongoose.Schema({
  _id: String,
  name: String
});

Category.plugin(melpers);
module.exports = mongoose.model('category', Category);