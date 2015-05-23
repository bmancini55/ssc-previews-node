let fs          = require('fs');
let csv         = require('csv');
let Mongo       = require('mongodb');
let config      = require('../../config');

let filepath = process.argv[2];


function exec(filepath) {

  let fields = null;
  let file = fs.createReadStream(filepath);
  let parser = csv.parse({ delimiter: '\t', quote: '^' });
  let transform = csv.transform(function(record, next) {  

    // convert the first row into the fields based ordinal position
    if(!fields) {
      fields = record.map((val) => val.toLowerCase());
    } 

    // process the array of values by converting into an object
    // matching the field names from the origin row
    else {

      let result = {};
      record.forEach((val, idx) => { 
        result[fields[idx]] = val;        
      });
      
      next(null, result);
    }
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
      console.log('Inserting: ' + data.diamd_no);    
      collection.insert(data);
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