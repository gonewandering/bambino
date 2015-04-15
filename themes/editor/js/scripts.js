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

			$(".selected-image").attr("src", lnk);
			$(".selected-image").removeClass("hidden");
			$(".dropbox-button").addClass("hidden");

			return true;
		}
	};

	$(".dropbox-button").on("click", function () { 
		Dropbox.choose(options);
	});

	// var button = Dropbox.createChooseButton(options);
	// $('.dropbox').append(button);

	// Draggable
    $( ".drag-item" ).draggable({ 
    	revert: true
    });

    $( ".gallery-drop" ).droppable({
      hoverClass: 'active',
      drop: function( event, ui ) {
		$.post("/editor/galleries/" + $(this).data("galleryid") + "/artworks/" + ui.draggable.data("artworkid"), function (res) { 

		});
	  }
	});

    $( ".page-drop" ).droppable({
      hoverClass: 'active',
      drop: function( event, ui ) {
      	console.log(ui.draggable.data('galleryid'));

		$.post("/editor/pages/" + $(this).data("pageid") + "/galleries/" + ui.draggable.data("galleryid"), function (res) { 
		});
	  }
	});
});