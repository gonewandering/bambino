var express = require('express'),
router = express.Router(),
db = require('../models'),
_ = require('underscore'),
config = require('../../config/config.js');

module.exports = function (app) {
	app.use('/', router);
};

router.get('/:slug', function (req, res, next) {
	var i = req.query.gid, options = {};

	if (req.params.slug == "editor") { next(); return false; }
	db.Page.findAll().success(function (pages) {

		options.pages = pages;

		db.Page.findOne({include: [{all: true, nested: true}], where: {'slug': req.params.slug}}).success(function (page) {
			options.Page = JSON.parse(JSON.stringify(page));
			options.Page.Gallery = _.filter(options.Page.Galleries, function(d){
				return d.id == i;
			});

			options.Page.Gallery = options.Page.Gallery[0] || false;

			res.render(page.template || 'index', options);
		});
	});
});

router.get('/:slug/:gid', function (req, res, next) {
	res.redirect('/' + req.params.slug + '?gid=' + req.params.gid);
});

router.get('/', function (req, res, next) {
	res.redirect(config.home || '/home');
});
