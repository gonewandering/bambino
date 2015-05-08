var fs = require('fs');

module.exports = {
  get: function (res, req, next) {
    fs.readFile('config/config.json', 'utf8', function (err, data) {
      var k = JSON.parse(data);
      req.render('settings', data);
    });
  }
}
