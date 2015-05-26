let mongoose  = require('mongoose');
let pagedlist = require('../helpers/pagedlist');
let melpers   = require('../helpers/mongoose');
let es        = require('../helpers/elasticsearch');

let Person = {
  _id: mongoose.Schema.ObjectId,
  fullname: String
};

let Series = { 
  _id: String,
  name: String
};

let Publisher= {
  _id: mongoose.Schema.ObjectId,
  name: String
};

let Category = {
  _id: String,
  name: String,
  forconsumers: Boolean
};

let Genre = {
  _id: String,
  name: String
};

let Preview = { 
  _id: false,
  previews_no: String,
  page: String  
};

let Item = mongoose.Schema({
  stock_no: String,
  parent_item: String,
  title: String,
  desc: String,
  variant_desc: String,
  series: Series,
  issue_no: Number,
  issue_seq_no: Number,
  volume_tag: String,
  max_issue: Number,
  price: Number,
  publisher: Publisher,
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
  category: Category,
  genre: Genre,  
  mature: Boolean,
  adult: Boolean,
  caution1: String,
  caution2: String,
  caution3: String,
  writer: Person,
  artist: Person,
  cover_artist: Person,  
  foc_date: Date,
  previews: [ Preview ]
});


async function search({ page = 1, pagesize = 24, previews, publisher, writer, artist }) {
  let filter = {};

  if(previews) {
    filter['previews.previews_no'] = new RegExp('^' + previews);
  }

  if(publisher) {
    filter['publisher._id'] = mongoose.Types.ObjectId(publisher);
  }

  if(writer) {
    filter['writer._id'] = mongoose.Types.ObjectId(writer);
  }

  if(artist) {
    filter['artist._id'] = mongoose.Types.ObjectId(artist);
  }

  let results = await this
    .find(filter, null, { skip: (page - 1) * pagesize, limit: pagesize })
    .sort({ 'previews.previews_no': 1 })
    .exec();

  let total = await this
    .count(filter)
    .exec();

  return pagedlist(results, page, pagesize, total);
}

async function saveElasticsearch() {  
  let client = es.client();
  let body = {
    stock_no: this.stock_no,
    title: this.title,
    description: this.description,
    variant_desc: this.variant_desc,
    series: this.series,
    publisher: this.publisher,
    upc_no: this.upc_no,
    isbn_no: this.isbn_no,
    ean_no: this.ean_no,
    ship_date: this.ship_date,
    category: this.category,
    genre: this.genre,
    mature: this.mature,
    adult: this.adult,
    writer: this.writer,
    artist: this.artist,
    cover_artist: this.cover_artist,
    previews: this.previews
  };

  await client.index({
    index: 'items',
    type: 'item',
    id: this._id.toString(),
    body: body
  });

}


async function elasticsearch({ page = 1, pagesize = 24, previews, publisher, writer, artist, query }) {
  let client = es.client();
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

  let results = await client.search(search);
  let hits = results.hits.hits;
  let total = results.hits.total;

  let ids = hits.map((hit) => mongoose.Types.ObjectId(hit._id));  
  let docs = await this
    .find({ _id: { $in: ids }})
    .sort({ 'previews.previewNumber': '1' })
    .exec();

  return pagedlist(docs, page, pagesize, total);
}

Item.methods.saveElasticsearch = saveElasticsearch;

Item.statics.search         = search;
Item.statics.elasticsearch  = elasticsearch;

Item.plugin(melpers);
module.exports = mongoose.model('item', Item);