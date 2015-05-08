var db = require('../../models'),
_ = require('underscore'),
config = require('../../../config/config.js'),
glob = require('glob'),
async = require('async');


module.exports = {

  get: function (req, res, next) {

    db.Page.findAll({
      include: [{all: true, nested: true}]
    }).success(function (items) {
      options = { pages: items };
      getTemplates(function (err, templates) {
        options.templates = templates;
        res.render('pages', options);
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

      options.page = options.page[0];
      getTemplates(function (err, templates) {
        options.templates = templates;
        res.render('page', options);
      });
    });
  },

  post: function (req, res, next) {

    if (req.body.id > 0) {
      var id = req.body.id;
      delete req.body.id;

      db.Page.update(req.body, { where: { id: id }}).then(function (item) {
        res.redirect('/editor/pages/' + id);
      });

    } else {
      db.Page.create(req.body).then(function (item) {
        res.redirect('/editor/pages/' + item.id);
      });
    }

  },

  delete: function (req, res, next) {
    db.Page.destroy({where: { id: req.params.id }}).then(function () {
      res.json("{success: true}");
    })
  }
}


var getTemplates = function (callback) {
  var path = config.root + "/themes/" + config.theme;
  glob(path + "*.handlebars", {}, function (err, files) {
    files = _.map(files, function (d) {
      return {
        path: d,
        name: d.replace(path, "").replace(".handlebars", "").replace("_", " ")
      };
    });
    callback(err, files);
  });
}
