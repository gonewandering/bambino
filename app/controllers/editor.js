var express = require('express'),
router = express.Router(),
db = require('../models'),
_ = require('underscore'),
config = require('../../config/config.js'),
async = require('async'),
fs = require('fs'),
glob = require('glob'),
mkdirp = require('mkdirp'),
md5 = require('MD5'),
session = require('express-sessions');

module.exports = function (app) {
  app.use('/editor', router);
};

var dl = {
  https: require('https'),
  http: require('http')
};



// Get Info

router.get('/', function (req, res, next) {
  res.redirect("/editor/pages");
});


// Setup users

router.get('/login', function (req, res, next) {

  db.User.findAll().then(function (users) {
    if (users.length == 0) { var newu = true; }
    res.render('login', {next: req.query.next, init: newu });
  });

});


router.post('/login', function (req, res, next) {
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
});


router.get('/logout', function (req, res, next) {

  req.session.user = null;
  res.redirect('/editor/login');

});


router.get('/users', function (req, res, next) {

  db.User.findAll().success(function (users) {
    res.render('users', { users: users });
  });

});


router.get('/users/:id', function (req, res, next) {

  db.User.findAll().success(function (users) {
    db.User.find(req.params.id).success(function (user) {
      res.render('users', { user: user, users: users });
    });
  });

});


router.post('/users', function (req, res, next) {

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

});

router.post('/users/password', function (req, res, next) {

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
});

// Setup page

router.get('/pages', function (req, res, next) {
  db.Page.findAll({
    include: [{all: true, nested: true}]
  }).on('sql', console.log).success(function (items) {
    options = { pages: items };
    getTemplates(function (err, templates) {
      options.templates = templates;
      res.render('pages', options);
    });
  });
});

router.get('/pages/:id', function (req, res, next) {
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
});

router.post('/pages', function (req, res, next) {

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
});

router.delete('/pages/:id', function (req, res, next) {
  db.Page.destroy({where: { id: req.params.id }}).then(function () {
    res.json("{success: true}");
  })
});



// Setup Gallery

router.get('/pages/:id/galleries', function (req, res, next) {
  db.Page.findAll({
    include: [{all: true, nested: true}],
    order: ['Galleries.PageGallery.order', 'Galleries.Artworks.GalleryArt.order']
  }).on('sql', console.log).success(function (items) {
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
});

router.get('/pages/:id/galleries/:aid', function (req, res, next) {
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
});

router.post('/pages/:id/galleries', function (req, res, next) {

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
});


router.post('/pages/:id/galleries/:gid', function (req, res, next) {
  db.Page.find(req.params.id).then(function (page) {
    db.Gallery.find(req.params.gid).then(function (gallery) {
      gallery.addPage(page, { active: true, order: 0 }).then(function (result) {
        res.json({"success": true});
      })
    });
  });
});

router.delete('/galleries/:gid', function (req, res, next) {
  db.PageGallery.destroy({where: {GalleryId: req.params.gid}}).then(function () {
    db.Gallery.destroy({where: {id: req.params.gid}}).then(function () {
      res.json({"success": true});
    });
  });
});

router.delete('/pages/:id/galleries/:gid', function (req, res, next) {
  db.PageGallery.destroy({where: {PageId: req.params.id, GalleryId: req.params.gid}}).then(function () {
    res.json({"success": true});
  });
});


router.post('/pages/:id/sort', function (req, res, next) {
  db.PageGallery.findAll({where: { PageId: req.params.id }}).then(function (pgs) {
    var items = req.body.order;

    async.each(pgs, function (d, callback) {
      var order = items.indexOf(String(d.GalleryId));
      d.update({"order": order}).on('sql', console.log).then(function () {
        callback();
      })
    }, function () {
      res.json({"success": true});
    });
  });
});



// Setup Artwork

router.get('/pages/:id/galleries/:aid/artworks', function (req, res, next) {
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
});

router.get('/pages/:id/galleries/:aid/artworks/:gid', function (req, res, next) {
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
});

router.post('/pages/:id/galleries/:aid/artworks', function (req, res, next) {

  if (req.body.id > 0) {
    var id = req.body.id;
    delete req.body.id;

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
});


router.post('/galleries/:id/artworks/:aid', function (req, res, next) {
  db.Gallery.find(req.params.id).then(function (gallery) {
    db.Artwork.find(req.params.aid).then(function (artwork) {
      artwork.addGallery(gallery, { active: true, order: 0 }).then(function (result) {
        res.json({"success": true});
      })
    });
  });
});


router.post('/pages/:id/galleries/:gid/sort', function (req, res, next) {
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
});

router.post('/pages/:id/galleries/:gid/', function (req, res, next) {
  db.Page.find(req.params.id).then(function (page) {
    db.Gallery.find(req.params.gid).then(function (gallery) {
      gallery.addPage(page, { active: true, order: 0 }).then(function (result) {
        res.json({"success": true});
      })
    });
  });
});

router.delete('/artworks/:aid', function (req, res, next) {
  db.GalleryArt.destroy({where: {ArtworkId: req.params.aid}}).then(function () {
    db.Artwork.destroy({where: {id: req.params.aid}}).then(function () {
      res.json({"success": true});
    });
  });
});

router.delete('/galleries/:gid/artworks/:aid', function (req, res, next) {
  db.GalleryArt.destroy({where: {GalleryId: req.params.gid, ArtworkId: req.params.aid}}).then(function () {
    res.json({"success": true});
  });
});


// Helpers

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

var getArt = function (item, http, cb) {
  var basePath = config.root + "/uploads/" + config.app.name;

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
