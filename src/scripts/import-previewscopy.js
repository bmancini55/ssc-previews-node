let fs          = require('fs');
let csv         = require('csv');
let mongoose    = require('../helpers/mongo');
let Models      = require('../models');
let config      = require('../../config');

function exec(filepath, { PreviewsItem }) {
  return new Promise(function(resolve) {

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
      
      let query = { 
        diamd_no: data.diamd_no 
      };
      let update = { 
        $set: { copy: data }        
      };

      PreviewsItem.findOneAndUpdate(query, update, function(err, result) {
        if(!err) console.log('Inserted: ' + data.diamd_no);
      });
    });

    // close the connection when done transforming
    transform.on('finish', function() {
      console.log('Insertions complete');
      resolve();      
    });
    
  });
}



mongoose.on('open', function() {
  let file = process.argv[2];

  if(!file) {
    console.log('You must supply a file path');
    mongoose.close();
  }

  exec(file, Models)
    .then(
      function() {
        mongoose.close();        
      }, 
      function(err) {
        mongoose.close();
        console.log(err.toString());
        console.log(err.stack);
      }
    );
});