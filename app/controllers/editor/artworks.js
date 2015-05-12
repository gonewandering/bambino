var db = require('../../models'),
_ = require('underscore'),
config = require('../../../config/config.js'),
async = require('async'),
fs = require('fs'),
glob = require('glob'),
mkdirp = require('mkdirp');

module.exports = {
  get: function (req, res, next) {
    db.Page.findAll({
      include: [{all: true, nested: true}],
      order: ['Galleries.PageGallery.order', 'Galleries.Artworks.GalleryArt.order']
    }).success(function (items) {
      options = {
        pages: items,
        page: false
      };

      options.page = _.filter(items, function (d, i) {
        if (d.id == req.params.id) {
          items[i].class = "active";
          return true;
        } else {
          return false;
        }
      });

      options.page = options.page[0] || null;

      options.gallery = _.filter(options.page.Galleries, function (d, i) {
        if (d.id == req.params.aid) {
          options.page.Galleries[i].class = "active";
          return true;
        } else {
          return false;
        }
      });

      options.gallery = options.gallery[0] || null;

      db.Artwork.findAll().success(function (items) {
        options.Artworks = items;
        res.render('artworks', options);
      });
    });
  },

  getOne: function (req, res, next) {
    db.Page.findAll({
      include: [{all: true, nested: true}],
      order: ['Galleries.PageGallery.order', 'Galleries.Artworks.GalleryArt.order']
    }).success(function (items) {

      options = {
        pages: items,
        page: false
      };

      options.page = _.filter(items, function (d, i) {
        if (d.id == req.params.id) {
          items[i].class = "active";
          return true;
        } else {
          return false;
        }
      });

      options.page = options.page[0] || null;

      options.gallery = _.filter(options.page.Galleries, function (d, i) {
        if (d.id == req.params.aid) {
          options.page.Galleries[i].class = "active";
          return true;
        } else {
          return false;
        }
      });

      options.gallery = options.gallery[0] || null;

      options.artwork = _.filter(options.gallery.Artworks, function (d, i) {
        if (d.id == req.params.gid) {
          options.gallery.Artworks[i].class = "active";
          return true;
        } else {
          return false;
        }
      });

      options.artwork = options.artwork[0] || null;

      res.render('artwork', options);
    });
  },

  post: function (req, res, next) {

    if (req.body.id > 0) {
      var id = req.body.id;
      delete req.body.id;

      if (req.body.created) {
        req.body.created = new Date(req.body.created);

        console.log(req.body.created);
      }

      db.Artwork.update(req.body, { where: { id: Number(id) }}).then(function (item) {
        db.Gallery.find(req.params.aid).then(function (gallery) {
          if (req.body.square.indexOf("https://") > -1) {
            getArt(item, 'https', function () {
              res.redirect('/editor/pages/' + req.params.id + '/galleries/' + req.params.aid + '/artworks/' + id);
            });
          } else if (req.body.square.indexOf("http://") > -1) {
            getArt(item, 'http', function () {
              res.redirect('/editor/pages/' + req.params.id + '/galleries/' + req.params.aid + '/artworks/' + id);
            });
          } else {
            res.redirect('/editor/pages/' + req.params.id + '/galleries/' + req.params.aid + '/artworks/' + id);
          }
        });
      });
    } else {
      db.Artwork.create(req.body).then(function (item) {
        db.Gallery.find(req.params.aid).then(function (gallery) {
          item.addGallery(gallery, { active: true, order: 0 }).then(function (result) {
            if (req.body.square.indexOf("https://") > -1) {
              getArt(item, 'https', function () {
                res.redirect('/editor/pages/' + req.params.id + '/galleries/' + req.params.aid + '/artworks/' + item.id);
              });
            } else if (req.body.square.indexOf("http://") > -1) {
              getArt(item, 'http', function () {
                res.redirect('/editor/pages/' + req.params.id + '/galleries/' + req.params.aid + '/artworks/' + item.id);
              });
            } else {
              res.redirect('/editor/pages/' + req.params.id + '/galleries/' + req.params.aid + '/artworks/' + item.id);
            }
          });
        });
      });
    }
  },

  addToGallery: function (req, res, next) {
    db.Gallery.find(req.params.id).then(function (gallery) {
      db.Artwork.find(req.params.aid).then(function (artwork) {
        artwork.addGallery(gallery, { active: true, order: 0 }).then(function (result) {
          res.json({"success": true});
        })
      });
    });
  },

  resort: function (req, res, next) {
    db.GalleryArt.findAll({where: { GalleryId: req.params.gid }}).then(function (pgs) {
      var items = req.body.order;

      async.each(pgs, function (d, callback) {
        var order = items.indexOf(String(d.ArtworkId));
        d.update({"order": order}).on('sql', console.log).then(function () {
          callback();
        })
      }, function () {
        res.json({"success": true});
      });
    });
  },

  delete: function (req, res, next) {
    db.GalleryArt.destroy({where: {ArtworkId: req.params.aid}}).then(function () {
      db.Artwork.destroy({where: {id: req.params.aid}}).then(function () {
        res.json({"success": true});
      });
    });
  },

  removeFromGallery: function (req, res, next) {
    db.GalleryArt.destroy({where: {GalleryId: req.params.gid, ArtworkId: req.params.aid}}).then(function () {
      res.json({"success": true});
    });
  }
}


var getArt = function (item, http, cb) {
  var basePath = config.root + "/uploads/" + config.app.name;
  var dl = {
    https: require('https'),
    http: require('http')
  };

  var imagePaths = {
    square: "/artwork/" + item.id +"/square.jpg",
    display: "/artwork/" + item.id +"/display.jpg",
    full: "/artwork/" + item.id +"/full.jpg"
  };

  mkdirp(basePath + "/artwork/" + item.id + "/",  function (err) {
    async.parallel([function (callback) {
      var file = fs.createWriteStream(basePath + imagePaths.square);
      var request = dl[http].get(item.square, function(response) {
        response.pipe(file);
        callback();
      });
    }, function (callback) {
      var file = fs.createWriteStream(basePath + imagePaths.display);
      var request = dl[http].get(item.display, function(response) {
        response.pipe(file);
        callback();
      });
    }, function (callback) {
      var file = fs.createWriteStream(basePath + imagePaths.full);
      var request = dl[http].get(item.full, function(response) {
        response.pipe(file);
        callback();
      });
    }], function () {
      db.Artwork.update(imagePaths, { where: { id: item.id } }).success(function () {
        cb();
      });
    });
  });
}
