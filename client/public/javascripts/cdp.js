;
(function($, window, undefined) {

    // outside the scope of the jQuery plugin to
    // keep track of all dropdowns
    var $allDropdowns = $();
    // if instantlyCloseOthers is true, then it will instantly
    // shut other nav items when a new one is hovered over
    $.fn.dropdownHover = function(options) {
        // don't do anything if touch is supported
        // (plugin causes some issues on mobile)
        if ('ontouchstart' in document) return this; // don't want to affect chaining
        // the element we really care about
        // is the dropdown-toggle's parent
        $allDropdowns = $allDropdowns.add(this.parent());
        return this.each(function() {
            var $this = $(this),
            $parent = $this.parent(),
            defaults = {
                delay: 0,
                hoverDelay: 0,
                instantlyCloseOthers: true
            },
            data = {
                delay: $(this).data('delay'),
                hoverDelay: $(this).data('hover-delay'),
                instantlyCloseOthers: $(this).data('close-others')
            },
            showEvent = 'show.bs.dropdown',
            hideEvent = 'hide.bs.dropdown',
                // shownEvent  = 'shown.bs.dropdown',
                // hiddenEvent = 'hidden.bs.dropdown',
                settings = $.extend(true, {}, defaults, options, data),
                timeout, timeoutHover;
                $parent.hover(function(event) {
                // so a neighbor can't open the dropdown
                if (!$parent.hasClass('open') && !$this.is(event.target)) {
                    // stop this event, stop executing any code
                    // in this callback but continue to propagate
                    return true;
                }
                openDropdown(event);
            }, function() {
                // clear timer for hover event
                window.clearTimeout(timeoutHover)
                timeout = window.setTimeout(function() {
                    $this.attr('aria-expanded', 'false');
                    $parent.removeClass('open');
                    $this.trigger(hideEvent);
                }, settings.delay);
            });
            // this helps with button groups!
            $this.hover(function(event) {
                // this helps prevent a double event from firing.
                // see https://github.com/CWSpear/bootstrap-hover-dropdown/issues/55
                if (!$parent.hasClass('open') && !$parent.is(event.target)) {
                    // stop this event, stop executing any code
                    // in this callback but continue to propagate
                    $('.dropdown-menu').addClass('animated fadeIn');
                    return true;
                }
                openDropdown(event);
            });
            // handle submenus
            $parent.find('.dropdown-submenu').each(function() {
                var $this = $(this);
                var subTimeout;
                $this.hover(function() {
                    window.clearTimeout(subTimeout);
                    $this.children('.dropdown-menu').show();
                    // always close submenu siblings instantly
                    $this.siblings().children('.dropdown-menu').hide();
                }, function() {
                    var $submenu = $this.children('.dropdown-menu');
                    subTimeout = window.setTimeout(function() {
                        $submenu.hide();
                    }, settings.delay);
                });
            });

            function openDropdown(event) {
                // clear dropdown timeout here so it doesnt close before it should
                window.clearTimeout(timeout);
                // restart hover timer
                window.clearTimeout(timeoutHover);
                // delay for hover event.
                timeoutHover = window.setTimeout(function() {
                    $allDropdowns.find(':focus').blur();
                    if (settings.instantlyCloseOthers === true)
                        $allDropdowns.removeClass('open');
                    // clear timer for hover event
                    window.clearTimeout(timeoutHover);
                    $this.attr('aria-expanded', 'true');
                    $parent.addClass('open');
                    $this.trigger(showEvent);
                }, settings.hoverDelay);
            }
        });
    };
    $(document).ready(function() {
        // apply dropdownHover to all elements with the data-hover="dropdown" attribute
        $('[data-hover="dropdown"]').dropdownHover();
    });
})(jQuery, window);
/*-----------------------------------*/
///////////////第三層選單keyUp///////////
/*-----------------------------------*/
$(function() {
    $('.js-activated').dropdownHover().dropdown();
    $('ul.nav').children('li.dropdown').keyup(
        function() {
            $(this).children().show();
            $(this).siblings().focus(function() {
                $(this).hide()
            });
        });
    $('ul.nav').children('li.dropdown').keyup(
        function() {
            $(this).siblings().children('ul').hide();
        });
    $('ul.nav li.dropdown li:last>a').focusout(
        function() {
            $('ul.nav li.dropdown ul').hide();
        })
});

/*-----------------------------------*/
///////////////gototop/////////////////
/*-----------------------------------*/
$(function() {
    $(".scrollToTop").click(function() {
        $("html,body").animate({ scrollTop: 0 }, 1000, "easeOutQuint");
        return false;
    });
});
$(function() {
    $(window).load(function() {
        $(window).bind('scroll resize', function() {
            var $this = $(this);
            var $this_Top = $this.scrollTop();
            //當高度小於130時，關閉區塊
            if ($this_Top < 100) {
                $(".scrollToTop").fadeOut();
            }
            //當高度小於130時，顯示區塊
            if ($this_Top > 100) {
                $(".scrollToTop").fadeIn();
            }
        }).scroll();
    });
});
/*-----------------------------------*/
///////////////gototop/////////////////
/*-----------------------------------*/

// $(function() {
//     $('.MainMenu .dropdown-menu').hover(function() {
//         $(this).parent('a').addClass('trigger');

//     }, function() {
//         $(this).parent('a').removeClass('trigger');
//     });
// });
$(function() {
    $('.home_grp ul li a').addClass('hvr-overline-from-left');

    /*-----------------------------------*/
    ///////////////P70/////////////////////
    /*-----------------------------------*/
    $('.sub_info').hide();
    function DROPDOWN(){
          // $(this).parent().siblings('td').toggleClass('noline');
          $(this).parent().parent('tr').toggleClass('line');
          $(this).toggleClass('i_inverse');
          $(this).parents().siblings('tr').children('.sub_info').hide();
          $(this).parent().parent().next('.sub_info').toggle();
        // $(this).parent().parent().next('.sub_info').next('td').toggleClass('addline');
        $(this).parent().parent().next('.sub_info').toggleClass('line');
    }
    $('.table_block').find('.fa-caret-down').click(DROPDOWN);
   //  $('.table_block').find('.fa-tag').click(function(event) {
   //   // $(this).parent().parent('tr').toggleClass('line');
   //     // $(this).toggleClass('i_inverse');
   //     $(this).parents().siblings('tr').children('.sub_info').hide();
   //     $(this).parent().parent().next('.sub_info').toggle();
   //     // $(this).parent().parent().next('.sub_info').next('td').toggleClass('addline');
   //     $(this).parent().parent().next('.sub_info').toggleClass('line');
   // });

});


$(function() {
    $("a:contains('複製連結')").css("white-space", "nowrap");
    $("a:contains('開啟連結')").css("white-space", "nowrap");
    $('.tag a').click(function(event) {
        return false;
    });
    $('.customize a').click(function(event) {
        $(this).parent('li').hide();
    });
});
$(function() {
    $('.search_block').hide();
    $('.search a').click(function(event) {
        $('.search_block').stop(true, true).slideToggle();
    });
});

/*-----------------------------------*/
///////////////menu////////////////////
/*-----------------------------------*/

$(function() {
    $('.menu .submenu').hide();
    $('body').append('<div class="floatMenu"></div>');
    $('.floatMenu').append('<button type="button" class="close"></button>');
    $('.menuBtn').hide();
    $('.floatMenu').hide();
    $(window).on("load resize", function(e) {
        var Win_W = $(window).width();
        H_height = $('header').outerHeight() - 75;
        // console.log(H_height);
        if (Win_W <= 767) {
            $('.menuBtn').show();
            // $('.floatMenu').appendTo('body');
            $('.custumer').appendTo('.floatMenu');
            $('.menu').appendTo('.floatMenu');
            $('.menuBtn').click(function(event) {
                $('.floatMenu').fadeIn();
            });
            $('.floatMenu .close').click(function(event) {
                $('.floatMenu').hide();
            });
            $('body').css('padding-top', H_height);
            $('.menu ul>li').each(function(index, el) {
                $(this).click(function(event) {
                    $(this).siblings('li').find('.submenu').slideUp();
                    $('body').addClass('noscroll');
                    $(this).children('.submenu').stop(true, true).slideToggle();
                });
            });
        } else {
            $('.menu').insertAfter('header');
            $('.menu .submenu').hide();
            $('.choose').parent('.submenu').addClass('big_submenu');
            $('.custumer').appendTo('header .container');
            $('.menuBtn').hide();
            $('.menu ul>li').each(function(index, el) {
                $(this).hover(function() {
                    $(this).children('.submenu').stop(true, true).fadeIn();
                }, function() {
                    $(this).children('.submenu').stop(true, true).fadeOut();
                    $(this).children('.submenu').children('.choose').siblings('a').hide();
                });
            });
            $('body').css('padding-top', 0);
            $('body').removeClass('noscroll');
        }
    });
});
/*-----------------------------------*/
///////////////模組選擇選單//////////////
/*-----------------------------------*/
$(function() {
    $('.choose').hover(function() {
     $('body').addClass('noscroll');
 }, function() {
    $('body').removeClass('noscroll');
});
    $('.choose').siblings('a').hide();
    var len = 15; // 超過50個字以"..."取代
    $(".choose ul li a").each(function(index) {
        if ($(this).text().length > len) {
            $(this).attr("title", $(this).text());
            var text = $(this).text().substring(0, len - 1) + "...";
            $(this).text(text);

        };


        $(this).click(function(event) {
            var spanText=$(this).html();
            console.log(text);
            $('.choose').siblings('h3').find('span').text(spanText);
            $('.choose').siblings('a').each(function(index, el) {
                $(this).hide();
                $(this).delay(100 * index).fadeIn();
            });

        });
    });
});
/*-----------------------------------*/
///////////////帳號設定/////////////////
/*-----------------------------------*/

$(function() {
    $('.loginBlock').hide();

    $('#setting').mousedown(function(event) {
        $('.loginBlock').stop(true, true).slideToggle();
        return false;
    });
    $('.loginBlock a').click(function(event) {
        $('.loginBlock').hide();
    });
    $(document).mousedown(function(e) {
        var target = e.target;
        if (!$(target).is('.loginBlock a')) {
            $('.custumer').find('.loginBlock').hide();
        }
    });
});
/*-----------------------------------*/
///////////////active/////////////////
/*-----------------------------------*/

$(function() {
    $('.feature').find('a').each(function(index, el) {
        $(this).click(function(event) {
            $('.feature').find('a').removeClass('active');
            $(this).addClass('active');
        });
    });
});
