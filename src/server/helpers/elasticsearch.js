let elasticsearch = require('elasticsearch');
let config        = require('../../config');

module.exports.client = function client() {
  return elasticsearch.Client({
    host: config.elasticsearch.uri
  });  
};