var db = require('../../models'),
_ = require('underscore'),
config = require('../../../config/config.js'),
async = require('async');

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

      options.page = options.page[0];

      res.render('galleries', options);
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

      res.render('gallery', options);
    });
  },

  post: function (req, res, next) {

    if (req.body.id > 0) {

      var id = req.body.id;
      delete req.body.id;

      db.Gallery.update(req.body, { where: { id: id }}).then(function (item) {
        res.redirect('/editor/galleries/' + id);
      });

    } else {
      db.Gallery.create(req.body).then(function (item) {
        db.Page.find(req.params.id).then(function (page) {
          item.addPage(page, { active: true, order: 0 }).then(function (result) {
            res.redirect('/editor/pages/' + page.id +'/galleries/' + item.id);
          });
        });
      });
    }
  },

  postOne: function (req, res, next) {
    db.Page.find(req.params.id).then(function (page) {
      db.Gallery.find(req.params.gid).then(function (gallery) {
        gallery.addPage(page, { active: true, order: 0 }).then(function (result) {
          res.json({"success": true});
        })
      });
    });
  },

  delete: function (req, res, next) {
    db.PageGallery.destroy({where: {GalleryId: req.params.gid}}).then(function () {
      db.Gallery.destroy({where: {id: req.params.gid}}).then(function () {
        res.json({"success": true});
      });
    });
  },

  removeFromPage: function (req, res, next) {
    db.PageGallery.destroy({where: {PageId: req.params.id, GalleryId: req.params.gid}}).then(function () {
      res.json({"success": true});
    });
  },

  resort: function (req, res, next) {
    db.PageGallery.findAll({where: { PageId: req.params.id }}).then(function (pgs) {
      var items = req.body.order;

      console.log(req.body);

      async.each(pgs, function (d, callback) {
        var order = items.indexOf(String(d.GalleryId));
        d.update({"order": order}).on('sql', console.log).then(function () {
          callback();
        })
      }, function () {
        res.json({"success": true});
      });
    });
  }
}
