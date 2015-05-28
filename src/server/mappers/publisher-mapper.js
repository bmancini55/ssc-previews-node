let pagedlist = require('../helpers/pagedlist');
let ObjectID = require('mongodb').ObjectID;

/*
{
  _id: ObjectID
  name: String,  
}
*/

module.exports = function(db) {
  let collection = db.collection('publishers');

  return {
    findAll: findAll,
    findOne: collection.findOneAsync.bind(collection),
    insertOne: insertOne
  };

  async function findAll() {
    let results = await collection
      .find({})
      .sort({ 'name': 1})
      .toArrayAsync();
    return pagedlist(results);
  }

  async function insertOne(data) {
    let result = await collection.insertOneAsync(data);
    return result.ops[0];
  }

};