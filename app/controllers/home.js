var express = require('express'),
router = express.Router(),
db = require('../models'),
config = require('../../config/config.js');

module.exports = function (app) {
	app.use('/', router);
};

router.get('/:slug', function (req, res, next) {
	var i = req.params.gid || 0;

	if (req.params.slug == "editor") { next(); return false; }
	db.Page.findAll().success(function (pages) {
		db.Page.findOne({where: {'slug': req.params.slug}}).success(function (page) {
			if (page) {
			page.getGalleries().then(function (galleries) {
				if (galleries && galleries.length > 0) { 

					page.galleries = galleries;
					galleries[i].getArtworks().then(function (artworks) { 
						page.galleries[i].artworks = artworks;
						page.gallery = page.galleries[i];
						page.pages = pages;

						res.render(page.template || 'index', page);
					});
				} else { 
					page.pages = pages;
					res.render(config.theme + page.template || 'index', page);
				}
			});
			} else { 
				next(); return false;
			}
		});
	});
});

router.get('/', function (req, res, next) {
	res.redirect('/home');
});
