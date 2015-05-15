var express = require('express')
  , static  = require('serve-static')
  , hbs     = require('express-hbs')

  , config  = require('../config')
  , app
  ;


// Create Express App
app = express();

// Configure Handlebars View Engine
app.engine('hbs', hbs.express4({
  defaultLayout: __dirname + '/views/shared/_layout.hbs'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

// Configure Static Files
app.use(static(__dirname + '/public'));

// Create home route
app.get('/', function(req, res) {
  var page      = req.query.page || 1
    , pagesize  = req.query.pagesize || 24
    , pagestart = (page - 1) * pagesize
    , model = { 
        page: page, 
        pagesize: pagesize,
        items: null        
      };

  var Connection = require('./services/mysql')
    , PreviewsItemSvc = require('./services/previewsitem-service')
    , PreviewsCopySvc = require('./services/previewscopy-service');

  var conn = new Connection(config);
  var itemSvc = new PreviewsItemSvc(conn);
  var copySvc = new PreviewsCopySvc(conn);

  
  itemSvc.findAll(function(err, results) {
    if(err) return res.status(500).send(err);    
    else {

      // TODO convert to PagedArray
      model.items = results.slice(pagestart, pagesize);
      model.items.page = page;
      model.items.pagesize = pagesize;
      model.items.totalitems = results.length;      
      model.items.lastpage = Math.max(results.length / pagesize);
      model.items.islastpage = model.items.lastpage === page;
      model.items.isfirstpage = page === 1;

      // JOIN copy data as seperate object
      copySvc.findAll(function(err, result) {
        if(err) return res.status(500).send(err);
        else {

          var lookup = {};          
          results.forEach(function(result) {
            lookup[result.stocknumber] = result;
          });
          model.items.forEach(function(item) {
            item.copy = lookup[item.diamondnumber];
          });

          return res.render('home/index', model);                
        }
      });
    }
  });    
});

app.listen(5050, function() {
  console.log('Server started on port 5050');
});