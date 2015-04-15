var express = require('express'),
router = express.Router(),
db = require('../models'),
config = require('../../config/config.js');

module.exports = function (app) {
	app.use('/', router);
};

router.get('/:slug', function (req, res, next) {
	var i = req.query.gid || 0, options = {};

	if (req.params.slug == "editor") { next(); return false; }
	db.Page.findAll().success(function (pages) {

		options.pages = pages;

		db.Page.findOne({where: {'slug': req.params.slug}}).success(function (page) {
			
			options.page = page;
			
			if (page) {
				page.getGalleries().then(function (galleries) {
					if (galleries && galleries.length > 0) { 
						
						options.galleries = galleries;

						galleries[i].getArtworks().then(function (artworks) { 
							options.galleries[i].artworks = artworks;
							
							options.gallery = galleries[i];

							res.render(page.template || 'index', options);
						});
					} else { 
						options.pages = pages;
						res.render(page.template || 'index', options);
					}
				});
			} else { 
				next(); return false;
			}
		});
	});
});

router.get('/:slug/:gid', function (req, res, next) {
	res.redirect('/' + req.params.slug + '?gid=' + req.params.gid);
});

router.get('/', function (req, res, next) {
	res.redirect(config.home || '/home');
});
