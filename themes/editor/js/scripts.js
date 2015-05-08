jQuery(document).ready(function ($) {

	// Dropbox Chooser
	var options = {
		linkType: 'direct',
		extensions: ['.jpeg', '.jpg', '.png'],
		success: function (files) {
			$(".upload").val(files[0].link);

			var square = files[0].thumbnailLink.replace("=75", "=256").replace("=fit", "=crop");
			var display = files[0].thumbnailLink.replace("=75", "=1280").replace("=fit", "=fit_one_and_overflow");

			$("[name='square']").attr("value", square);
			$("[name='display']").attr("value", display);
			$("[name='full']").attr("value", files[0].link);

			$(".selected-image").attr("src", display);
			$(".selected-image").removeClass("hidden");
			$(".dropbox-button").addClass("hidden");

			return true;
		}
	};

	var button = Dropbox.createChooseButton(options);

	$('[data-show]').on('click', function () {
		var show = $(this).data('show');
		$(".tab").hide();
		$(show).fadeIn();
		return false;
	});

	$('.dropbox').append(button);


	// Set up sorting and drag drop for libraries

	var sortUpdateGallery = function (e, dom) {
		var type = dom.item.data("type"),
			order = [], id = dom.item.data("gid"),
			pid = dom.item.data("pid");

		dom.item.parents('ul').children('li').each(function (d) {
			order.push($(this).data('gid'));
		});

		$.post("/editor/pages/" + pid + "/sort", {
			order: order
		}, function (res) {
			console.log(res);
		});
	}

	var sortUpdateArtwork = function (e, dom) {
		var type = dom.item.data("type"),
			order = [],
			id = dom.item.data("aid"),
			gid = dom.item.data("gid"),
			pid = dom.item.data("pid");

		dom.item.parents('ul').children('li').each(function (d) {
			order.push($(this).data('aid'));
		});

		console.log(order);

		$.post("/editor/pages/" + pid + "/galleries/" + gid +"/sort", {
			order: order
		}, function (res) {
			console.log(res);
		});
	}

	$( ".sortable.galleries" ).sortable({
		update: sortUpdateGallery,
		revert: true,
		handle: '.handle',
		axis: 'y'
	});

	$( ".sortable.galleries" ).disableSelection();

	$( ".sortable.artworks" ).sortable({
		update: sortUpdateArtwork,
		revert: true,
		handle: '.handle',
		axis: 'y'
	});

	$( ".sortable.artworks" ).disableSelection();


	// Draggable

	$( ".add-to-gallery.artwork" ).draggable({
		revert: 'invalid',
		helper: 'clone',
		handle: '.drag-item'
	});

	$( ".add-to-page.gallery" ).draggable({
		revert: 'invalid',
		helper: 'clone',
		handle: '.drag-item'
	});

	$( ".gallery" ).droppable({
		hoverClass: 'active-drag',
		accept: '.add-to-gallery',
		drop: function( event, ui ) {
			var p = $(this);
			$.post("/editor/galleries/" + $(this).data("gid") + "/artworks/" + ui.draggable.data("aid"), function (res) {
				p.find("label").text(p.find("label") + 1);
			});
		}
	});

	$( ".page" ).droppable({
		hoverClass: 'active-drag',
		accept: '.add-to-page',
		drop: function( event, ui ) {
			var p = $(this);
			$.post("/editor/pages/" + $(this).data("pid") + "/galleries/" + ui.draggable.data("gid"), function (res) {
				p.find("label").text(p.find("label") + 1);
			});
		}
	});


	// Delete functions

	$('.delete-gallery').on('click', function () {
		var art = $(this);
		$.ajax({
			url: "/editor/pages/" + $(this).data('id') + "/galleries/" + $(this).data('gid'),
			method: 'DELETE',
			complete: function (res) {
				art.parents(".gallery").remove();
			}
		});
	});

	$('.delete-art').on('click', function () {
		var art = $(this);
		$.ajax({
			url: "/editor/galleries/" + $(this).data('gid') + "/artworks/" + $(this).data('aid'),
			method: 'DELETE',
			complete: function (res) {
				art.parents(".artwork").remove();
			}
		});
	});

});
