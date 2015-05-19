require('babel/register');

var express     = require('express')
  , srvstatic   = require('serve-static')
  , hbs         = require('express-hbs')  
  
  , hbshelpers  = require('./helpers/handlebars')
  , mongo       = require('./helpers/mongo')
  , controllers = require('./controllers')  
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
app.use('/public', srvstatic(__dirname + '/public'));

// Add Home Controller
app.get('/', controllers.home.index);

// Start the application
app.listen(5000, function() {
  console.log('Server started on port 5000');
});