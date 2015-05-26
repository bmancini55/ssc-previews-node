let express   = require('express');
let Models    = require('../models');
let Item      = Models.Item;
let Publisher = Models.Publisher;
let Person    = Models.Person;

async function index(req, res) {
  let { page, pagesize, publisher, writer, artist, query } = req.query;  
  let previews  = 'MAY15';  
  
  let publishers  = await Publisher.findAll({ 
    page: 1, 
    pagesize: 2147483647, 
    sorter: { 'name': 1 } 
  });
  let writers     = await Person.findWriters();
  let artists     = await Person.findArtists();
  let items       = await Item.search({
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
  index: (req, res) => index(req, res).then(null, function(err) { res.status(500).send(err.message); })
};