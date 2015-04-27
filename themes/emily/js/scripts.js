jQuery(document).ready(function ($) {

  // Set up gallery items
  $('.matrix-item .modal img').css({
    'max-width': '100%',
    'max-height': window.innerHeight - 200,
    'width': 'auto'
  });

  $('.matrix-item:gt(8)').hide();

  // Add loaded class to elements
  $('.fade').addClass('in');

});
