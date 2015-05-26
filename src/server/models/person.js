let mongoose = require('mongoose');
let melpers  = require('../helpers/mongoose');

let Person = mongoose.Schema({
  fullname: String,
  writer: Boolean,
  artist: Boolean,
  coverartist: Boolean
});


async function findWriters() {
  return await this
    .find({ writer: true })
    .sort({ fullname: 1 })
    .exec();
}

async function findArtists() {
  return await this
    .find({ artist: true })
    .sort({ fullname: 1 })
    .exec();
}

async function findCoverArtists() {
  return await this
    .find({ coverartist: true })
    .sort({ fullname: 1 })
    .exec();
}


Person.statics.findWriters = findWriters;
Person.statics.findArtists = findArtists;
Person.statics.findCoverArtists = findCoverArtists;

Person.plugin(melpers);
module.exports = mongoose.model('person', Person);