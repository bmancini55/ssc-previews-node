let mongoose  = require('mongoose');
let pagedlist = require('./pagedlist');

module.exports = function(schema) {

  schema.statics.findAll = findAll;

};

/**
 * Finds all values in a collection
 * including paging and optional sorting
 *
 * @param {Number} page
 * @param {Number} pagesize 
 * @return {Array[Item]}
 */
async function findAll({ page = 1, pagesize = 24, sorter }) {  

  let options = {
    skip: (page - 1) * pagesize,
    limit: pagesize    
  };

  let results = await this
    .find(null, null, options)
    .sort(sorter)
    .exec();

  let total = await this
    .count(null)
    .exec();

  return pagedlist(results, page, pagesize, total);
}