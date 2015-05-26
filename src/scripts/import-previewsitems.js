let fs          = require('fs');
let csv         = require('csv');
let mongoose    = require('../helpers/mongo');
let Models      = require('../models');
let config      = require('../../config');

function exec(filepath, { PreviewsItem }) {
  return new Promise(function(resolve) {

    let fields = null;
    let file = fs.createReadStream(filepath);
    let parser = csv.parse({ delimiter: '\t', quote: '^' });  // tabs with no quotes
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

    // parse and transform into an object
    file
      .pipe(parser)
      .pipe(transform);      

    // insert the transformed object into the datastore
    transform.on('data', function(data) {
      console.log('Inserting: ' + data.diamd_no);    
      let previewsitem = new PreviewsItem(data);
      previewsitem.save();
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