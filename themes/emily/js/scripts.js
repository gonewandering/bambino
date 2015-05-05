jQuery(document).ready(function ($) {

  // Set up gallery items

  $('.matrix-item:gt(8)').hide();

  var min = -1;
  var max = 9;

  $('.matrix-footer .min').text(min + 1);
  $('.matrix-footer .max').text($('.matrix-item').length);

  $('.matrix-footer .backward').on('click', function () {
    if (min > 0) {
      min = min - 9;
      max = max - 9;

      $('.matrix-item').hide();
      $('.matrix-footer .min').text(min + 2);
      $('.matrix-footer .max').text($('.matrix-item').length);

      if (min < 0) {
        $('.matrix-item:lt('+max+')').show();
      } else {
        $('.matrix-item:lt('+max+'):gt('+min+')').fadeIn();
      }
    }
  });

  $('.matrix-footer .forward').on('click', function () {
    if (max < $('.matrix-item').length) {
      max = max + 9;
      min = min + 9;

      $('.matrix-footer .min').text(min + 1);
      $('.matrix-footer .max').text($('.matrix-item').length);

      $('.matrix-item').hide();
      $('.matrix-item:lt('+max+'):gt('+min+')').fadeIn();
    }
  });

  // Modal Calculate Width

  $('.modal').on('shown.bs.modal', function () {

    $('.matrix-item').removeClass('modal-show');
    var n = $(this).parents('.matrix-item');

    if (n.css('display') == 'none') {
      n.addClass('modal-show');
    }

    var hh = $(this).find('img').height();

    $(this).find('.modal-dialog').css({
      'width': window.innerWidth - 50
    });

    $(this).find('img').css({
      'max-height': window.innerHeight - 150,
      'width': 'auto'
    });

    var h = $(this).find('.modal-dialog').height();
    var wh = $(window).height();

    $(this).find('.modal-dialog').css({
      'margin-top': ((wh-h)/2) + "px"
    });
  });

  $('.modal').on('hidden.bs.modal', function () {
    $('.matrix-item').removeClass('modal-show');
  });

  $('.modal-close').on('click', function () {
    $(this).parents('.modal').modal('hide');
  });

  // Modal forward and backward

  var slideSwitch = function (item, dir) {
    var m = item.parents('.modal');
    var n = m.parents('.matrix-item')[dir]();

    var cl = dir == 'next' ? 'last' : 'first';
    var lc = dir == 'next' ? 'first' : 'last';

    if (m.parents('.matrix-item').is(':'+cl+'-child')) {
      n = $('.matrix-item')[lc]();
    }

    m.modal('hide');
    n.find('.modal').modal('show');

  }

  $('.modal .forward-one').on('click', function () { slideSwitch($(this), 'next'); });
  $('.modal .back-one').on('click', function () { slideSwitch($(this), 'prev'); });

  // Add loaded class to elements
  $('.fade').addClass('in');

});
