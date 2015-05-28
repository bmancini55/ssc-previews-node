let pagedlist = require('../helpers/pagedlist');
let ObjectID = require('mongodb').ObjectID;


/*
{
  _id: ObjectID
  stock_no: String,
  parent_item: String,
  title: String,
  desc: String,
  variant_desc: String,
  series: { 
    _id: String,
    name: String
  },
  issue_no: Number,
  issue_seq_no: Number,
  volume_tag: String,
  max_issue: Number,
  price: Number,
  publisher: {
    _id: ObjectID,
    name: String
  },
  upc_no: String,
  isbn_no: String,
  ean_no: String,
  cards_per_pack: Number,
  pack_per_box: Number,
  box_per_case: Number,
  discount_code: String,  
  print_date: Date,  
  ship_date: Date,
  srp: Number,
  category: {
    _id: String,
    name: String,
    forconsumers: Boolean
  },
  genre: {
    _id: String,
    name: String
  },  
  mature: Boolean,
  adult: Boolean,
  caution1: String,
  caution2: String,
  caution3: String,
  writer: {
    _id: ObjectID,
    fullname: String
  },
  artist: {
    _id: ObjectID,
    fullname: String
  },
  cover_artist: {
    _id: ObjectID,
    fullname: String
  },  
  foc_date: Date,
  previews: [{     
    previews_no: String,
    page: String  
  }]
}
*/

module.exports = function(db, es) {
  let collection = db.collection('items');

  return {
    search: search,
    insertOne: insertOne,
    index: index,
    elasticsearch: elasticsearch
  };

  async function search({ page = 1, pagesize = 24, previews, publisher, writer, artist }) {
    let filter = {};

    if(previews) {
      filter['previews.previews_no'] = new RegExp('^' + previews);
    }

    if(publisher) {
      filter['publisher._id'] = new ObjectID(publisher);
    }

    if(writer) {
      filter['writer._id'] = new ObjectID(writer);
    }

    if(artist) {
      filter['artist._id'] = new ObjectID(artist);
    }

    let results = await collection
      .find(filter)
      .sort({ 'previews.previews_no': 1 })
      .skip((page - 1) * pagesize)
      .limit(pagesize)
      .toArrayAsync();

    let total = await collection
      .countAsync(filter);

    return pagedlist(results, page, pagesize, total);
  }

  async function insertOne(data) {
    let result = await collection.insertOneAsync(data);
    return result.ops[0];
  }


  async function index(item) {      
    let body = {
      stock_no: item.stock_no,
      title: item.title,
      description: item.description,
      variant_desc: item.variant_desc,
      series: item.series,
      publisher: item.publisher,
      upc_no: item.upc_no,
      isbn_no: item.isbn_no,
      ean_no: item.ean_no,
      ship_date: item.ship_date,
      category: item.category,
      genre: item.genre,
      mature: item.mature,
      adult: item.adult,
      writer: item.writer,
      artist: item.artist,
      cover_artist: item.cover_artist,
      previews: item.previews
    };

    await es.index({
      index: 'items',
      type: 'item',
      id: item._id.toString(),
      body: body
    });

  }


  async function elasticsearch({ page = 1, pagesize = 24, previews, publisher, writer, artist, query }) {    
    let search = {
      index: 'items',
      type: 'item',
      body: {
        from: (page - 1 ) * pagesize,
        size: pagesize,
        query: {
          filtered: {    
            filter: {
              bool: {
                must: [ ]
              }
            },
            query: {
              bool: {
                should: [ ]
              }
            }
          }
        },
        sort: 'previews.previews_no'
      }    
    };
    let filters = search.body.query.filtered.filter.bool.must;
    let queries = search.body.query.filtered.query.bool.should;
    
    if(publisher) {
      filters.push({
        term: { 'publisher._id': publisher },    
      });
    }

    if(writer) {
      filters.push({
        term: { 'writer._id': writer }
      });      
    }

    if(artist) {
      filters.push({
        term: { 'artist._id': artist }
      });
    }      

    if(query) {
      queries.push.apply(queries, [
        { match_phrase: { 'title': query } },
        { match_phrase: { 'publisher.name': query } },
        { match_phrase: { 'artist.fullname': query } },
        { match_phrase: { 'writer.fullname': query } }
      ]);
    }

    let results = await es.search(search);
    let hits = results.hits.hits;
    let total = results.hits.total;

    let ids = hits.map((hit) => ObjectID(hit._id));  
    let docs = await collection
      .find({ _id: { $in: ids }})
      .sort({ 'previews.previewnumber': 1 })
      .toArrayAsync();

    return pagedlist(docs, page, pagesize, total);
  }

};