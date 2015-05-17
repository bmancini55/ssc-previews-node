let express   = require('express');
let Models    = require('../models');
let Item      = Models.Item;
let Publisher = Models.Publisher;
let Person    = Models.Person;

async function index(req, res) {
  let page      = req.query.page;
  let pagesize  = req.query.pagesize;
  let previews  = 'MAY15';
  let publisher = req.query.publisher;
  let writer    = req.query.writer;
  let artist    = req.query.artist;
  
  let publishers  = await Publisher.findAll({ page: 1, pagesize: 2147483647, sorter: { 'Name': 1 } });
  let writers     = await Person.findWriters();
  let artists     = await Person.findArtists();
  let items       = await Item.search({
    page: page, 
    pagesize: pagesize,
    previews: previews,
    publisher: publisher,
    writer: writer,
    artist: artist
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
    artist: artist
  };
  res.render('home/index', model);
}


module.exports = {
  index: (req, res) => index(req, res).then(null, function(err) { res.status(500).send(err.message); })
};