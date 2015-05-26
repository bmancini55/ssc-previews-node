require('babel/register');

let mongoose  = require('../helpers/mongo');
let Models    = require('../models');
let Progress  = require('progress');
let ObjectId  = require('mongoose').Types.ObjectId;
let Q         = require('q');

/**
 * Processes preview info and converts it into Items.
 * Each item that gets processed will attach the corresponding 
 * sub elemetns and emit the appropriate event
 */
async function exec(preview, { PreviewsItem, Category, Genre, Series, Publisher, Person, Item }) {  
  
  // retrieve the previews items to insert  
  let items = await PreviewsItem.findByPreview(preview);
  console.log('\nFound %s Previews Items to process\n',  items.length);
    
  let categories = await getOrAdd({
    items:    items,    
    name:     'categories',     
    findOne:  (key)  => Category.findOne({ _id: key }),
    keyGen:   (item) => item.category, 
    insGen:   (item) => new Category({ _id: item.category, name: '' })
  });  

  let genres = await getOrAdd({
    items:    items,    
    name:     'genres',    
    findOne:  (key)  => Genre.findOne({ _id: key }),
    keyGen:   (item) => item.genre,
    insGen:   (item) => new Genre({ _id: item.genre, name: '' })
  });

  let series = await getOrAdd({
    items:    items,
    name:     'series',
    findOne:  (item) => Series.findOne({ _id: item.series_code }),
    keyGen:   (item) => item.series_code,
    insGen:   (item) => new Series({ _id: item.series_code, name: item.main_desc })
  });  

  let publishers = await getOrAdd({
    items:    items,
    name:     'publishers',
    findOne:  (item) => Publisher.findOne({ name: item.publisher }),
    keyGen:   (item) => item.publisher,
    insGen:   (item) => new Publisher({ name: item.publisher })
  });

  let writers = await getOrAdd({
    items:    items, 
    name:     'writers',
    findOne:  (item) => Person.findOne({ fullname: item.writer }),
    keyGen:   (item) => item.writer,
    insGen:   (item) => new Person({ fullname: item.writer, writer: true, artist: false, coverartist: false }),
    updGen:   (inst) => inst.writer = true
  });

  let artists = await getOrAdd({
    items:    items,
    name:     'artists',
    findOne:  (item) => Person.findOne({ fullname: item.artist }),
    keyGen:   (item) => item.artist,
    insGen:   (item) => new Person({ fullname: item.artist, writer: false, artist: true, coverartist: false }),
    updGen:   (inst) => inst.artist = true
  });

  let coverartists = await getOrAdd({
    items:    items,
    name:     'cover artists',
    findOne:  (item) => Person.findOne({ fullname: item.cover_artist }),
    keyGen:   (item) => item.cover_artist,
    insGen:   (item) => new Person({ fullname: item.cover_artist, writer: false, artist: false, coverartist: true }),
    updGen:   (inst) => inst.coverartist = true
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

    let genreLink = null;
    if(genre) {
      genreLink = {
        _id: genre._id,
        name: genre.name
      };
    }

    let categoryLink = null;
    if(category) {
      categoryLink = {
        _id: category._id,
        name: category.name
      };
    }

    let seriesLink = null;
    if(seri) {
      seriesLink = { 
        _id: seri._id,
        name: seri.name
      };
    }

    let publisherLink = null;
    if(publisher) {
      publisherLink = {
        _id: publisher._id,
        name: publisher.name
      };
    }

    let writerLink = null;
    if(writer) {
      writerLink = {
        _id: writer._id,
        fullname: writer.fullname
      };
    }

    let artistLink = null;
    if(artist) {
      artistLink = {
        _id: artist._id,
        fullname: artist.fullname
      };
    }

    let coverartistLink = null;
    if(coverartist) {
      coverartistLink = {
        _id: coverartist._id,
        fullname: coverartist.fullname
      };
    }

    let newItem = new Item({
      stock_no: item.stock_no,
      parent_item: item.parent_item_no_alt,
      title: item.copy.title,
      desc: item.copy.preview + '\n' + item.copy.description,
      variant_desc: item.variant_desc,
      series: seriesLink,
      issue_no: parseInt(item.issue_no) || null,
      issue_seq_no: parseInt(item.issue_seq_no) || null,
      volume_tag: item.volume_tag,
      max_issue: parseInt(item.max_issue) || null,
      price: parseFloat(item.price) || null,
      publisher: publisherLink,
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
      category: categoryLink,
      genre: genreLink,
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
    });

    await newItem.save();
    progress.tick();
  }

    
}

async function getOrAdd({ items, name, findOne, keyGen, insGen, updGen = null }) {
  console.log('Processing %s', name);
    
  let uniques = new Map();
  let inserts = new Map();
  let updates = new Map();

  // fetch all unique keys
  let progress1 = new Progress(' analyzing [:bar] :current/:total', { total: items.length, width: 50 });
  for (let item of items) {
    let key     = keyGen(item);
    let insert  = insGen(item);

    // populate with insert item, which we will replace later with
    // the actual value if it already exists
    if(key !== '' && !uniques.has(key)) {
      uniques.set(key, insert);
    }

    progress1.tick();
  }
  
  // iterate keys and determine if we need to insert or update
  let progress2 = new Progress(' fetching  [:bar] :current/:total', { total: uniques.size, width: 50 });
  for (let key of uniques.keys()) {                   
    let found = await findOne(key);    
    let value = found || uniques.get(key);  // use found or insert statement

    if(found) {
      updates.set(key, value);
    }
    else if(key !== '') {
      inserts.set(key, value);
    }
    progress2.tick();
  }

  // process the inserts
  if(inserts.size > 0) {
    let progress3 = new Progress(' inserting [:bar] :current/:total', { total: inserts.size, width: 50 });  
    for (let kvp of inserts) {
      await kvp[1].save();
      progress3.tick();
    }  
  }

  // process the updates  
  if(updGen && updates.size > 0) {    
    let progress4 = new Progress(' updating  [:bar] :current/:total', { total: updates.size, width: 50 });
    for (let kvp of updates) {
      updGen(kvp[1]);
      await kvp[1].save();
      progress4.tick();
    }
  }

  // create results by combining existing with insertions
  let results = new Map();
  for (let result of updates) 
    results.set(result[0], result[1]);
  for (let result of inserts) 
    results.set(result[0], result[1]);

  console.log('');  
  return results;
}


mongoose.on('open', function() {
  let preview = process.argv[2];
  exec(preview, Models)
    .then(
      function() {
        mongoose.close();        
        console.log('\nProcessing complete');
      }, 
      function(err) {
        mongoose.close();
        console.log(err.toString());
        console.log(err.stack);
      }
    );
});
