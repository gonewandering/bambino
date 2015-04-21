var express = require('express');
var glob = require('glob');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var exphbs  = require('express-handlebars');
var session = require('express-session');

module.exports = function(app, config) {

  app.use(function (req, res, next) {
    if (req.path.indexOf("editor") > -1) {
      app.engine('handlebars', exphbs({
        layoutsDir: config.root + '/themes/editor/layouts/',
        defaultLayout: 'main',
        partialsDir: [config.root + '/themes/editor/partials/']
      }));
      app.set('views', config.root + '/themes/editor');
    } else {
      app.engine('handlebars', exphbs({
        layoutsDir: config.root + '/themes/'+config.theme+'/layouts/',
        defaultLayout: 'main',
        partialsDir: [config.root + '/themes/'+config.theme+'/partials/']
      }));
      app.set('views', config.root + '/themes/' + config.theme);
    }

    next();
  });

  app.use(session({
    resave: true,
    cookie: { httpOnly: false },
    saveUninitialized: false,
    secret: 'There are cold things done in the midnight sun'
  }));

  app.set('view engine', 'handlebars');

  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';

  // app.use(favicon(config.root + '/public/img/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(cookieParser());
  app.use(compress());
  app.use(express.static(config.root + '/themes'));
  app.use(express.static(config.root + '/uploads/' + config.app.name));
  app.use(methodOverride());

  app.use(function (req, res, next) { 
    if (req.path.indexOf("editor") > -1 && req.path.indexOf("editor/login") == -1) {
        if (req.session && req.session.user) {
          next();
        } else {
          res.redirect("/editor/login");
        }
    } else {
      next();
    }
  });

  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach(function (controller) {
    require(controller)(app);
  });

  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if(app.get('env') === 'development'){
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error'
      });
    });
  }

  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
      });
  });

};
