let mongoose = require('mongoose');

let Genre = mongoose.Schema({
  Name: String,  
}, { collection: 'genre' });

require('../helpers/mongoose-plugins')(Genre);
module.exports = mongoose.model('genre', Genre);