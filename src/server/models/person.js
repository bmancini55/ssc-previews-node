let mongoose = require('mongoose');
let melpers  = require('../helpers/mongoose');

let Person = mongoose.Schema({
  FullName: String,
  Writer: Boolean,
  Artist: Boolean,
  CoverArtist: Boolean
}, { collection: 'person' });


async function findWriters() {
  return await this
    .find({ Writer: true })
    .sort({ FullName: 1 })
    .exec();
}

async function findArtists() {
  return await this
    .find({ Artist: true })
    .sort({ FullName: 1 })
    .exec();
}

async function findCoverArtists() {
  return await this
    .find({ CoverArtist: true })
    .sort({ FullName: 1 })
    .exec();
}


Person.statics.findWriters = findWriters;
Person.statics.findArtists = findArtists;
Person.statics.findCoverArtists = findCoverArtists;

Person.plugin(melpers);
module.exports = mongoose.model('person', Person);