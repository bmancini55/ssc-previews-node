require('babel/register');

let Progress  = require('progress');
let mongodb = require('../helpers/mongodb');
let elastic = require('../helpers/elasticsearch');
let mappers = require('../mappers');


/**
 * Processes preview info and converts it into Items.
 * Each item that gets processed will attach the corresponding 
 * sub elemetns and emit the appropriate event
 */
async function exec(preview, { previewsitemMapper, categoryMapper, genreMapper, seriesMapper, publisherMapper, personMapper, itemMapper }) {  
  
  // retrieve the previews items to insert  
  let items = await previewsitemMapper.findByPreview(preview);
  console.log('\nFound %s Previews Items to process\n',  items.length);
    
  let categories = await getOrAdd({
    items:    items,    
    name:     'categories',     
    keyGen:   (item) => item.category, 
    findOne:  (item) => categoryMapper.findOne({ _id: item.category }),    
    insert:   (item) => categoryMapper.insertOne({ _id: item.category, name: '' })
  });  

  let genres = await getOrAdd({
    items:    items,    
    name:     'genres',        
    keyGen:   (item) => item.genre,
    findOne:  (item) => genreMapper.findOne({ _id: item.genre }),
    insert:   (item) => genreMapper.insertOne({ _id: item.genre, name: '' })
  });

  let series = await getOrAdd({
    items:    items,
    name:     'series',
    keyGen:   (item) => item.series_code,
    findOne:  (item) => seriesMapper.findOne({ _id: item.series_code }),    
    insert:   (item) => seriesMapper.insertOne({ _id: item.series_code, name: item.main_desc })
  });  

  let publishers = await getOrAdd({
    items:    items,
    name:     'publishers',    
    keyGen:   (item) => item.publisher,
    findOne:  (item) => publisherMapper.findOne({ name: item.publisher }),
    insert:   (item) => publisherMapper.insertOne({ name: item.publisher })
  });

  let writers = await getOrAdd({
    items:    items, 
    name:     'writers',    
    keyGen:   (item) => item.writer,
    findOne:  (item) => personMapper.findOne({ fullname: item.writer }),
    insert:   (item) => personMapper.insertOne({ fullname: item.writer, writer: true, artist: false, cover_artist: false }),
    update:   (item) => personMapper.findOneAndSet({ fullname: item.writer }, { writer: true })
  });

  let artists = await getOrAdd({
    items:    items,
    name:     'artists',    
    keyGen:   (item) => item.artist,
    findOne:  (item) => personMapper.findOne({ fullname: item.artist }),
    insert:   (item) => personMapper.insertOne({ fullname: item.artist, writer: false, artist: true, cover_artist: false }),
    update:   (item) => personMapper.findOneAndSet({ fullname: item.artist }, { artist: true })
  });

  let coverartists = await getOrAdd({
    items:    items,
    name:     'cover artists',    
    keyGen:   (item) => item.cover_artist,
    findOne:  (item) => personMapper.findOne({ fullname: item.cover_artist }),
    insert:   (item) => personMapper.insertOne({ fullname: item.cover_artist, writer: false, artist: false, cover_artist: true }),
    update:   (item) => personMapper.findOneAndSet({ fullname: item.cover_artist }, { cover_artist: true })
  });


  console.log('Processing items');
  let progress = new Progress(' inserting [:bar] :current/:total', { total: items.length, width: 50 });

  for(let item of items) {    
    let genre       = genres.get(item.genre);
    let category    = categories.get(item.category);
    let seri        = series.get(item.series_code);
    let publisher   = publishers.get(item.publisher);
    let writer      = writers.get(item.writer);
    let artist      = artists.get(item.artist);
    let coverartist = coverartists.get(item.cover_artist);

    let writerLink = writer ? {
      _id: writer._id,
      fullname: writer.fullname
    } : null;

    let artistLink = artist ? {
      _id: artist._id,
      fullname: artist.fullname
    } : null;

    let coverartistLink = coverartist ? {
      _id: coverartist._id,
      fullname: coverartist.fullname
    } : null;
    
    let newItem = {
      stock_no: item.stock_no,
      parent_item: item.parent_item_no_alt,
      title: item.copy.title,
      desc: item.copy.preview + '\n' + item.copy.description,
      variant_desc: item.variant_desc,
      series: seri,
      issue_no: parseInt(item.issue_no) || null,
      issue_seq_no: parseInt(item.issue_seq_no) || null,
      volume_tag: item.volume_tag,
      max_issue: parseInt(item.max_issue) || null,
      price: parseFloat(item.price) || null,
      publisher: publisher,
      upc_no: item.upc_no,
      isbn_no: item.short_isbn_no,
      ean_no: item.ean_no,
      cards_per_pack: parseInt(item.cards_per_pack),
      pack_per_box: parseInt(item.pack_per_box),
      box_per_case: parseInt(item.box_per_case),
      discount_code: item.discount_code,
      print_date: Date.parse(item.prnt_date) ? new Date(item.prnt_date) : null,
      ship_date: Date.parse(item.ship_date) ? new Date(item.ship_date) : null,
      srp: parseFloat(item.srp),
      category: category,
      genre: genre,
      mature: item.mature === 'Y' ? true : false,
      adult: item.adult === 'Y' ? true : false,
      caution1: item.caut1,
      caution2: item.caut2,
      caution3: item.caut3,
      writer: writerLink,
      artist: artistLink,
      cover_artist: coverartistLink,
      foc_date: Date.parse(item.foc_date) ? new Date(item.foc_date) : null,
      previews: [{ 
          previews_no: item.diamd_no,
          page: item.page
      }]
    };

    // save in mongo
    newItem = await itemMapper.insertOne(newItem);

    // save in elasticsearch
    await itemMapper.index(newItem);
    
    progress.tick();
  }

    
}

/** 
 * Internal function for processing joinable data.
 * This function will iterate the items and determine what
 * inserts and updates need to be performed for the joined data
 */
async function getOrAdd({ items, name, findOne, keyGen, insert, update }) {
  console.log('Processing %s', name);
    
  let uniques = new Map();
  let inserts = new Map();
  let updates = new Map();
  let results = new Map();

  // fetch all unique keys and the corresponding item it is associated with
  let progress1 = new Progress(' analyzing [:bar] :current/:total', { total: items.length, width: 50 });
  for (let item of items) {

    let key = keyGen(item);    

    if(key && key !== '' && !uniques.has(key)) {
      uniques.set(key, item);
    }
    progress1.tick();
  }
  
  // iterate unique keys to create insert and update expressions
  let progress2 = new Progress(' fetching  [:bar] :current/:total', { total: uniques.size, width: 50 });
  for (let key of uniques.keys()) {                   

    let item = uniques.get(key);
    let found = await findOne(item);

    if(found) {
      if(update) {
        updates.set(key, () => update(item));
      } else {
        results.set(key, found);
      }
    }
    else if(key !== '') {
      inserts.set(key, () => insert(item));
    }
    progress2.tick();
  }

  // process the inserts expressions
  if(inserts.size > 0) {
    let progress3 = new Progress(' inserting [:bar] :current/:total', { total: inserts.size, width: 50 });  
    for (let key of inserts.keys()) {
      let expr = inserts.get(key);
      let result = await expr();
      results.set(key, result);
      progress3.tick();
    }  
  }

  // process the updates expressions
  if(updates.size > 0) {
    let progress4 = new Progress(' updating  [:bar] :current/:total', { total: updates.size, width: 50 });
    for (let key of updates.keys()) {      
      let expr = updates.get(key);
      let result = await expr();
      results.set(key, result);
      progress4.tick();
    }
  }

  // create results by combining existing with insertions
  console.log('');  
  return results;
}



let preview = process.argv[2];
if(!preview) {
  console.log('You must specify a preview');  
}

mongodb.connect();
mongodb.on('open', function(db) {
  let es = elastic.client();
  let _mappers = mappers(db, es);  
  exec(preview, _mappers)
    .then(function() {
      mongodb.disconnect();
    })
    .catch(function(err) {        
      mongodb.disconnect();
      console.log(err.toString());
      console.log(err.stack);
    });
});
