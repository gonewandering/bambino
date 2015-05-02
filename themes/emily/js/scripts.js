jQuery(document).ready(function ($) {

  // Set up gallery items
  $('.matrix-item .modal img').css({
    'max-width': '100%',
    'max-height': window.innerHeight - 200,
    'width': 'auto'
  });

  $('.matrix-item:gt(8)').hide();

  var min = 0;
  var max = 10;

  $('.matrix-footer .min').text(min + 1);
  $('.matrix-footer .max').text($('.matrix-item').length);

  $('.matrix-footer .backward').on('click', function () {
    if (min > 0) {
      min = min - 9;
      max = max - 9;

      $('.matrix-footer .min').text(min + 1);
      $('.matrix-footer .max').text($('.matrix-item').length);

      $('.matrix-item').hide();
      $('.matrix-item:lt('+max+'):gt('+min+')').fadeIn();
    }
  });

  $('.matrix-footer .forward').on('click', function () {
    if (max < $('.matrix-item').length-1) {
      max = max + 9;
      min = min + 9;

      $('.matrix-footer .min').text(min + 1);
      $('.matrix-footer .max').text($('.matrix-item').length);

      $('.matrix-item').hide();
      $('.matrix-item:lt('+max+'):gt('+min+')').fadeIn();
    }
  });

  // Add loaded class to elements
  $('.fade').addClass('in');

});
