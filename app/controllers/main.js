var express = require('express'),
router = express.Router(),
db = require('../models'),
_ = require('underscore'),
config = require('../../config/config.js');

module.exports = function (app) {
	app.use('/', router);
};

var routes = {
	get: function (req, res, next) {
		var i = req.params.gid > 0 ? req.params.gid : null,
			options = {};

		res.options = res.options || {};

		if (req.params.slug == 'editor') {
			next(); return false;
		} else if (!req.params.slug) {
			req.params.slug = 'home';
		}

		db.Page.findAll().success(function (pages) {
			db.Page.findOne({
				include: [{ all: true, nested: true }],
		    order: [ 'Galleries.PageGallery.order', 'Galleries.Artworks.GalleryArt.order' ],
				where: { 'slug': req.params.slug }
			}).success(function (page) {

				if (!page) { return next(); }

				res.options.Pages = pages;
				res.options.Page = JSON.parse(JSON.stringify(page));

				res.options.Pages = _.map(res.options.Pages, function (d) {
					if (d.id == res.options.Page.id) {
						d.active = true;
					} return d;
				});

				if (res.options.Page && res.options.Page.Galleries) {

					res.options.Page.Gallery = _.filter(res.options.Page.Galleries, function(d){
						return d.id == i;
					});

					res.options.Page.Gallery = res.options.Page.Gallery[0] || false;

					if (!res.options.Page.Gallery) {
						res.options.Page.Gallery = res.options.Page.Galleries[0];
					}
				}

				res.render(res.options.Page.template || 'main', res.options);
			});
		});
	},
}

router.get('/:slug', routes.get);
router.get('/:slug/:gid', routes.get);
router.get('/', routes.get);
