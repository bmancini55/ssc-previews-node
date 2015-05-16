var mysql   = require('mysql');

function MySqlServer(config) {
  this.config = config;
}

module.exports = MySqlServer;

MySqlServer.prototype.getConnection = function getConnection() {
  var config = this.config;
  return mysql.createConnection({
    host: config.mysql.host,
    database: config.mysql.database,
    user: config.mysql.user,
    password: config.mysql.password
  });  
};