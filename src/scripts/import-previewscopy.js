require('babel/register');

let fs = require('fs');
let csv = require('csv');
let Q = require('q');
let mongodb = require('../helpers/mongodb');
let mappers = require('../mappers');

function exec(filepath, { previewsitemMapper }) {
  return new Promise(function(resolve) {

    let updates = [];
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


    // parse and transform into an object
    file
      .pipe(parser)
      .pipe(transform);      

    // insert the transformed object into the datastore
    transform.on('data', function(data) {            
      updates.push(previewsitemMapper
        .updateCopy(data)
        .then((result) => console.log('Inserted: ' + result.diamd_no))        
      );
    });

    // close the connection when done transforming
    transform.on('finish', function() {
      Q.all(updates)
       .then(() => console.log('Updates complete'))
       .then(resolve);     
    });
    
  });
}



let file = process.argv[2];
if(!file) {
  console.log('You must supply a file path');  
}

mongodb.connect();
mongodb.on('open', function(db) {
  let _mappers = mappers(db);  
  exec(file, _mappers)
    .then(function() {
      mongodb.disconnect();
    })
    .catch(function(err) {        
      mongodb.disconnect();
      console.log(err.toString());
      console.log(err.stack);
    });
});
