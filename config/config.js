var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'emilysilver'
    },
    port: 3000,
    db: 'sqlite://localhost/emilysilver-development',
    storage: rootPath + '/data/emilysilver-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'emilysilver'
    },
    port: 3000,
    db: 'sqlite://localhost/emilysilver-test',
    storage: rootPath + '/data/emilysilver-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'emilysilver'
    },
    port: 3000,
    db: 'sqlite://localhost/emilysilver-production',
    storage: rootPath + 'data/emilysilver-production'
  }
};

module.exports = config[env];
