var express = require('express'),
router = express.Router(),
db = require('../models'),
_ = require('underscore'),
config = require('../../config/config.js'),
async = require('async'),
https = require('https'),
fs = require('fs'),
mkdirp = require('mkdirp');

module.exports = function (app) {
    app.use('/editor', router);
};



// Get Info

var getAll = function (callback) { 
    db.Page.findAll().success(function (pages) {
        db.Gallery.findAll().success(function (galleries) {
            db.Artwork.findAll().success(function (artworks) {
                callback({ 
                    pages: pages,
                    galleries: galleries,
                    artworks: artworks
                })
            });
        });
    });
}

router.get('/', function (req, res, next) {
    getAll(function (options) { 
        res.render('editor', options);
    });
});



// Setup page

router.get('/pages', function (req, res, next) {
    getAll(function (options) { 

        options.page = { active: true };
        res.render('editor', options);
    });
});

router.get('/pages/:id', function (req, res, next) {
    getAll(function (options) { 

        db.Page.find(req.params.id).success(function (item) {

            if (!item) { next(); return false; }
            options.page = item;
            options.active = 'page';

            options.pages = _.map(options.pages, function (d) { 
               d.class = d.id == item.id ? 'active' : '';
               return d;
            });

            item.getGalleries().then(function(galleries) { 
                options.page.galleries = galleries;
                res.render('editor', options);
            });
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

router.post('/pages/:id/galleries/:gid', function (req, res, next) {
    db.Page.find(req.params.id).then(function (page) { 
        db.Gallery.find(req.params.gid).then(function (gallery) { 
            gallery.addPage(page, { active: true, order: 0 }).then(function (result) { 
                res.json({"success": true});
            })
        });
    });
});


// Setup gallery

router.get('/galleries', function (req, res, next) {
    getAll(function (options) { 

        options.gallery = true;
        res.render('editor', options);
    });
});

router.get('/galleries/:id', function (req, res, next) {
    getAll(function (options) { 

        db.Gallery.find(req.params.id).success(function (item) {

            options.gallery = item;
            options.active = 'gallery';

            options.galleries = _.map(options.galleries, function (d) { 
               d.class = d.id == item.id ? 'active' : '';
               return d;
            });

            item.getArtworks().then(function(artworks) { 

                options.gallery.artworks = artworks;
                res.render('editor', options);

            });
        });
    });
});

router.post('/galleries', function (req, res, next) {

    if (req.body.id > 0) { 
        var id = req.body.id;
        delete req.body.id;

        db.Gallery.update(req.body, { where: { id: id }}).then(function (item) { 
            res.redirect('/editor/galleries/' + id);
        });

    } else { 
        db.Gallery.create(req.body).then(function (item) { 
            res.redirect('/editor/galleries/' + item.id);
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


// Setup artwork

router.get('/artworks', function (req, res, next) {
    getAll(function (options) { 

        options.artwork = true;
        res.render('editor', options);
    });
});

router.get('/artworks/:id', function (req, res, next) {
    getAll(function (options) { 

        db.Artwork.find(req.params.id).success(function (item) {
            options.artworks = _.map(options.artworks, function (d) { 
                if (item && d.id && item.id) { 
                    d.class = d.id == item.id ? 'active' : '';
                    return d;
                } else { return d; }
            });

            options.artwork = item;
            options.active = 'gallery';
            res.render('editor', options);

        });
    });
});

router.post('/artworks', function (req, res, next) {

    if (req.body.id > 0) { 
        var id = req.body.id;
        delete req.body.id;

        db.Artwork.update(req.body, { where: { id: Number(id) }}).then(function (item) { 
            if (req.body.square.indexOf("dropbox") > -1) { 
                req.body.id = id;
                getArt(req.body, function () { 
                    res.redirect('/editor/artworks/' + id);
                })
            } else { 
                res.redirect('/editor/artworks/' + id);
            }
        });

    } else { 
        db.Artwork.create(req.body).then(function (item) { 
            if (req.body.square.indexOf("dropbox")) { 
                getArt(item, function () { 
                    res.redirect('/editor/artworks/' + id);
                });
            } else { 
                res.redirect('/editor/artworks/' + id);
            }
        });
    }
});

var getArt = function (item, cb) { 
    var basePath = config.root + "/uploads/" + config.app.name;

    var imagePaths = {
        square: "/artwork/" + item.id +"/square.jpg",
        display: "/artwork/" + item.id +"/display.jpg",
        full: "/artwork/" + item.id +"/full.jpg"
    };

    mkdirp(basePath + "/artwork/" + item.id + "/",  function (err) { 
        async.parallel([function (callback) { 
            var file = fs.createWriteStream(basePath + imagePaths.square);
            var request = https.get(item.square, function(response) {
              response.pipe(file);
              callback();
            });   
        }, function (callback) { 
           var file = fs.createWriteStream(basePath + imagePaths.display);
           var request = https.get(item.display, function(response) {
              response.pipe(file);
              callback();
            });  
        }, function (callback) { 
           var file = fs.createWriteStream(basePath + imagePaths.full);
           var request = https.get(item.full, function(response) {
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