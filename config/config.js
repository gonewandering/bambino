var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development',
    _ = require('underscore');

var conf = {
  root: rootPath,
  theme: 'emily',
  app: {
    name: 'emilysilver'
  },
  port: process.env.PORT || 3000,
};

conf.db = conf.db || 'sqlite://localhost/' + conf.app.name + "-" + env;
conf.storage = conf.root + '/data/' + conf.app.name + "-" + env;

module.exports = conf;
