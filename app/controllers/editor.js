var express = require('express'),
router = express.Router(),
db = require('../models'),
_ = require('underscore'),
config = require('../../config/config.js'),
async = require('async'),
fs = require('fs'),
glob = require('glob'),
mkdirp = require('mkdirp'),
session = require('express-sessions');

module.exports = function (app) {
  app.use('/editor', router);
};

// Get Info
router.get('/', function (req, res, next) {
  res.redirect("/editor/pages");
});

// Setup settings
var settings = require('./editor/settings');
router.get('/settings', settings.get);
// Setup users
var users = require('./editor/users');

router.get('/login', users.login.get);
router.post('/login', users.login.post);
router.get('/logout', users.logout.get);
router.get('/users', users.get);
router.get('/users/:id', users.getOne);
router.post('/users', users.post);
router.post('/users/password', users.password);

// Setup page
var pages = require('./editor/pages');

router.get('/pages', pages.get);
router.get('/pages/:id', pages.getOne);
router.post('/pages', pages.post);

// Setup Gallery
var galleries = require('./editor/galleries');

router.get('/pages/:id/galleries', galleries.get);
router.get('/pages/:id/galleries/:aid', galleries.getOne);
router.post('/pages/:id/galleries', galleries.post);
router.post('/pages/:id/galleries/:gid', galleries.postOne);
router.delete('/galleries/:gid', galleries.delete);
router.delete('/pages/:id/galleries/:gid', galleries.removeFromPage);
router.post('/pages/:id/sort', galleries.resort);

// Setup Artwork
var artworks = require('./editor/artworks');

router.get('/pages/:id/galleries/:aid/artworks', artworks.get);
router.get('/pages/:id/galleries/:aid/artworks/:gid', artworks.getOne);
router.post('/pages/:id/galleries/:aid/artworks', artworks.post);
router.post('/galleries/:id/artworks/:aid', artworks.addToGallery);
router.post('/pages/:id/galleries/:gid/sort', artworks.resort);
router.delete('/artworks/:aid', artworks.delete);
router.delete('/galleries/:gid/artworks/:aid', artworks.removeFromGallery);
