let express = require('express');
let mongodb = require('../helpers/mongodb');
let elastic = require('../helpers/elasticsearch');
let mappers = require('../mappers');

async function index(req, res) {
  let db = mongodb.db;
  let es = elastic.client();
  let { page, pagesize, publisher, writer, artist, query } = req.query;  
  let { publisherMapper, personMapper, itemMapper } = mappers(db, es);
  let previews  = 'MAY15';  
  
  let publishers  = await publisherMapper.findAll();
  let writers     = await personMapper.findWriters();
  let artists     = await personMapper.findArtists();
  let items       = await itemMapper.elasticsearch({
    page: page, 
    pagesize: pagesize,
    previews: previews,
    publisher: publisher,
    writer: writer,
    artist: artist,
    query: query
  });

  let model = { 
    page: page, 
    pagesize: pagesize,
    items: items,
    publishers: publishers,
    writers: writers,
    artists: artists,
    publisher: publisher,
    writer: writer,
    artist: artist,
    query: query
  };
  res.render('home/index', model);
}


module.exports = {
  index: (req, res) => index(req, res).then(null, function(err) { res.status(500).send(err.stack); })
};