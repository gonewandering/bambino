var db = require('../../models'),
_ = require('underscore'),
config = require('../../../config/config.js'),
md5 = require('MD5'),
async = require('async');


module.exports = {

  get: function (req, res, next) {

    db.User.findAll().success(function (users) {
      res.render('users', { users: users });
    });

  },

  getOne: function (req, res, next) {

    db.User.findAll().success(function (users) {
      db.User.find(req.params.id).success(function (user) {
        res.render('users', { user: user, users: users });
      });
    });

  },

  post: function (req, res, next) {

    if (req.body.id > 0) {
      var id = req.body.id;
      delete req.body.id;

      db.User.update(req.body, { where: { id: id }}).then(function (item) {
        res.redirect('/editor/users/' + id);
      });

    } else {
      req.body.password = md5(req.body.password);
      db.User.create(req.body).then(function (item) {
        res.redirect('/editor/users/' + item.id);
      });
    }

  },

  password: function (req, res, next) {

    if (req.body.id > 0) {
      var id = req.body.id;
      delete req.body.id;

      req.body.password = md5(req.body.password);
      db.User.update(req.body, { where: { id: id }}).then(function (item) {
        res.redirect('/editor/users/' + id);
      });
    } else {
      res.redirect('/editor/users/' + id);
    }

  },

  logout: {
    get: function (req, res, next) {

      req.session.user = null;
      res.redirect('/editor/login');

    }
  },

  login: {
    get: function (req, res, next) {
      console.log("THIS FAR");
      db.User.findAll().then(function (users) {
        if (users.length == 0) { var newu = true; }
        res.render('login', {next: req.query.next, init: newu });
      });
    },

    post: function (req, res, next) {

      db.User.findAll().then(function (users) {

        if (users.length == 0) {

          req.body.password = md5(req.body.password);

          db.User.create(req.body).then(function (user) {
            req.session.user = user;
            if (req.body.next) {
              res.redirect(req.body.next);
            } else {
              res.redirect('/editor/');
            }
          });

        } else {
          db.User.findOne({where: { email: req.body.email }}).then(function (user) {

            if (user && user.password == md5(req.body.password)) {
              req.session.user = user;
              if (req.body.next) {
                res.redirect(req.body.next);
              } else {
                res.redirect('/editor/');
              }
            } else {
              res.session.messages.push(['Incorrect login info']);
              res.redirect('/editor/login');
            }

          });
        }
      });
    }
  }
}
