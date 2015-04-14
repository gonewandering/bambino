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
	db.Page.findOne({where: {'slug': req.params.slug}}).success(function (page) {
		if (page) {
		page.getGalleries().then(function (galleries) {
			if (galleries && galleries.length > 0) { 

				page.galleries = galleries;

				galleries[i].getArtworks().then(function (artworks) { 
					page.galleries[i].artworks = artworks;
					page.gallery = page.galleries[i];

					res.render(page.template || 'index', page);
				});
			} else { 

				res.render(config.theme + page.template || 'index', page);
			}
		});
		} else { 
			next(); return false;
		}
	});
});

router.get('/', function (req, res, next) {
	var i = req.params.gid || 0;

	db.Page.findOne({where: {'slug': 'home'}}).success(function (page) {
		if (page) { 
			page.getGalleries().then(function (galleries) {
				if (galleries && galleries.length > 0) { 

					page.galleries = galleries;
					
					galleries[i].getArtworks().then(function (artworks) { 
						page.galleries[i].artworks = artworks;
						page.gallery = page.galleries[i];

						res.render(config.theme + page.template || 'index', page);
					});
				} else { 
					res.render(page.template || 'index', page);
				}
			});
		} else { next(); return false; }
	});
});
