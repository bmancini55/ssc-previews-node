var express = require('express')
  , static  = require('serve-static')
  , hbs     = require('express-hbs')

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
  res.render('home/index', { items: [], pageNumber: 1, isFirstPage: true, isLastPage: true });
});

app.listen(5050, function() {
  console.log('Server started on port 5050');
});