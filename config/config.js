var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    theme: 'emilysilver/',
    app: {
      name: 'bambino'
    },
    port: 3000,
    db: 'sqlite://localhost/bambino-development',
    storage: rootPath + '/data/bambino-development'
  },

  test: {
    root: rootPath,
    theme: 'emilysilver/',
    app: {
      name: 'bambino'
    },
    port: 3000,
    db: 'sqlite://localhost/bambino-test',
    storage: rootPath + '/data/bambino-test'
  },

  production: {
    root: rootPath,
    theme: 'emilysilver/',
    app: {
      name: 'bambino'
    },
    port: 3000,
    db: 'sqlite://localhost/bambino-production',
    storage: rootPath + 'data/bambino-production'
  }
};

module.exports = config[env];
