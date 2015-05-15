var mysql   = require('mysql');

function Service(server) {
  this.server = server;
}

module.exports = Service;

Service.prototype.findAll = function findAll(next) {
  var conn = this.server.getConnection();
  conn.connect();
  conn.query('select * from previewsitem order by itemid;', function(err, result) {
    conn.end();
    next(err, result);
  });
};