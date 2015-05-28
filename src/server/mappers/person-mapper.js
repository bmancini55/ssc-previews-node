let pagedlist = require('../helpers/pagedlist');
let ObjectID  = require('mongodb').ObjectID;

/*
{
  _id: ObjectID
  fullname: String,
  writer: Boolean,
  artist: Boolean,
  coverartist: Boolean
}
*/

module.exports = function(db) {
  let collection = db.collection('people');

  return {    
    findArtists: findArtists,
    findOne: collection.findOneAsync.bind(collection),
    findCoverArtists: findCoverArtists,
    findWriters: findWriters,

    insertOne: insertOne,
    findOneAndSet: findOneAndSet
  };

  async function findArtists() {
    let results = await collection
      .find({ artist: true })
      .sort({ 'fullname': 1 })
      .toArrayAsync();
    return pagedlist(results);
  }

  async function findCoverArtists() {
    return await collection
      .find({ cover_artist: true })
      .sort({ 'fullname': 1 })
      .toArrayAsync();
    return pagedlist(results);      
  }

  async function findWriters() {
    let results = await collection
      .find({ writer: true })
      .sort({ 'fullname': 1})
      .toArrayAsync();
    return pagedlist(results);
  }

  async function insertOne(data) {
    let result = await collection.insertOneAsync(data);
    return result.ops[0];
  }

  async function findOneAndSet(filter, set) {
    let update = {
      $set: set
    };
    let options = {
      returnOriginal: false
    };
    let results = await collection.findOneAndUpdateAsync(filter, update, options);
    return results.value;
  }
};