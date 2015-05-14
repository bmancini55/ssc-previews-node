var express = require('express')
  , static  = require('serve-static')
  , hbs     = require('express-hbs')

  , config  = require('../config')
  , mysql   = require('mysql')

  , conn
  , app
  ;

// Create MySQL connection
conn = mysql.createConnection({
  host: config.mysql.host,
  database: config.mysql.database,
  user: config.mysql.user,
  password: config.mysql.password
}); 

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

  // TODO move to mysql service
  conn.connect();
  conn.query('select * from previewsitem order by itemid;', function(err, results) {
    if(err) {
      conn.end();
      return res.status(500).send(err);      
    } else {

      // TODO convert to PagedArray
      model.items = results.slice(pagestart, pagesize);
      model.items.page = page;
      model.items.pagesize = pagesize;
      model.items.totalitems = results.length;      
      model.items.lastpage = Math.max(results.length / pagesize);
      model.items.islastpage = model.items.lastpage === page;
      model.items.isfirstpage = page === 1;

      // JOIN copy data as seperate object
      conn.query('select * from previewscopy;', function(err, results) {
        conn.end();  
        var lookup = {};
        if(err) {          
          return res.status(500).send(err);
        } else {

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