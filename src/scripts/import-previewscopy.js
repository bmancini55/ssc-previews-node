let fs          = require('fs');
let csv         = require('csv');
let Mongo       = require('mongodb');
let config      = require('../../config');

let filepath = process.argv[2];


function exec(filepath) {

  let fields = [ 'diamd_no', 'title', 'price', 'preview', 'description' ];
  let file = fs.createReadStream(filepath);
  let parser = csv.parse({ delimiter: '\t', quote: '"' });  // tabs with quote
  let transform = csv.transform(function(record, next) {  
  
    let result = {};
    record.forEach((val, idx) => { 
      result[fields[idx]] = val;        
    });
    
    next(null, result);

  });

  // connect to mongo 
  Mongo.MongoClient.connect(config.mongo.connection, function(err, db) {
    var collection = db.collection('previewsitem');

    // parse and transform into an object
    file
      .pipe(parser)
      .pipe(transform);      

    // insert the transformed object into the datastore
    transform.on('data', function(data) {
      

      let query = { 
        diamd_no: data.diamd_no 
      };
      let update = { 
        $set: { copy: data }        
      };

      collection.findOneAndUpdate(query, update, function(err, result) {
        if(!err) console.log('Inserted: ' + data.diamd_no);    
      });
    });

    // close the connection when done transforming
    transform.on('finish', function() {
      console.log('Insertions complete');
      db.close();
    });

  });
}

if(!process.argv[2]) {
  console.log('You must supply a file path');  
} else {
  exec(process.argv[2]);
}