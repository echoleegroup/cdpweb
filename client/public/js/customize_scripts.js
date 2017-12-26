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
///////////////Slick輪播///////////////
/*-----------------------------------*/
$(document).ready(function() {
    //Single_slider 單張輪播
    $('.Single_slider').slick({
        dots: false, //要不要顯示圓點
        dotsClass: 'slick-dots',
        infinite: true,
        autoplay: false,
        fade: true,
        autoplaySpeed: 3000,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true
    });
    // /Responsive Display 縮小成手機板時會變成單張輪播
    $('.cp_slider').slick({
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 1500,
        adaptiveHeight: true,
        responsive: [{
            breakpoint: 1024,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: true,
                dots: true
            }
        }, {
            breakpoint: 600,
            settings: {
                arrows: true,
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }, {
            breakpoint: 480,
            settings: {
                arrows: true,
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }]
    });
    //Multiple Items 多張輪播
    $('.Multiple-items').slick({
        dots: true,
        dotsClass: 'slick-number',
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        slidesToShow: 3, //一次顯示幾張
        slidesToScroll: 3 //一次輪播幾張
    });
    //Variable Items 寬度不一的多張輪播
    $('.variable-width').slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        centerMode: true,
        variableWidth: true
    });
    $('.one-time').slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        adaptiveHeight: true
    });
    $('.uneven').slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 4
    });
    //Responsive Display 縮小成手機板時會變成單張輪播
    $('.Responsive_slider').slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 4,
        autoplay: true,
        autoplaySpeed: 1500,
        responsive: [{
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                infinite: true,
                dots: true
            }
        }, {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        }, {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }]
    });
    //Vertical_slider 垂直自動輪播
    $('.Vertical_slider').slick({
        dots: false,
        infinite: true,
        vertical: true,
        verticalSwiping: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3,
        autoplay: true,
        autoplaySpeed: 1500,

        speed: 1000,
        // centerMode: true,
        focusOnSelect: true,
        //      responsive: [{
        //          breakpoint: 990,
        //          settings: {
        //              slidesToShow: 2,
        //              slidesToScroll: 2
        //          }
        //      }, {
        //          breakpoint: 600,
        //          settings: {
        //              slidesToShow: 2,
        //              slidesToScroll: 2,
        //              vertical: false,
        //              verticalSwiping: false

        //          }
        //      }, {
        //          breakpoint: 480,
        //          settings: {
        //              slidesToShow: 1,
        //              slidesToScroll: 1,
        //              vertical: false,
        //              verticalSwiping: false
        //          }
        //      }]
    });
    //vertical-syncing 垂直點小圖換大圖輪播
    $('.vertical-syncing').slick({
        dots: false,
        infinite: true,
        vertical: true,
        verticalSwiping: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 4,
        autoplay: true,
        autoplaySpeed: 1500,
        speed: 1000,
        centerMode: true,
        focusOnSelect: true,
        responsive: [{
            breakpoint: 990,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3
            }
        }, {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                vertical: false,
                verticalSwiping: false

            }
        }, {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                vertical: false,
                verticalSwiping: false
            }
        }]
    });
    // /Responsive Display 縮小成手機板時會變成單張輪播
    $('.mp_stuffSlider').slick({
        dots: false,
        infinite: true,
        speed: 500,
        arrows: true,
        slidesToShow: 5,
        slidesToScroll: 5,
        autoplay: true,
        autoplaySpeed: 1500,
        responsive: [{
            breakpoint: 1024,
            settings: {
                slidesToShow: 5,
                slidesToScroll: 5,
                infinite: true,
                dots: false
            }
        }, {
            breakpoint: 600,
            settings: {
                arrows: false,
                slidesToShow: 3,
                slidesToScroll: 3
            }
        }, {
            breakpoint: 480,
            settings: {
                arrows: false,
                slidesToShow: 2,
                slidesToScroll: 2
            }
        }]
    });
    //Responsive Display 縮小成手機板時會變成單張輪播
    $('.Responsive_slider').slick({
        dots: false,
        adaptiveHeight: true,
        infinite: true,
        speed: 1500,
        arrows: false,
        fade: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        pauseOnHover: false,
        autoplaySpeed: 2500,
        responsive: [{
            breakpoint: 1024,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: true,
                dots: false
            }
        }, {
            breakpoint: 600,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }, {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }]
    });
    // /Responsive Display 縮小成手機板時會變成單張輪播
    $('.website_slider').slick({
        dots: false,
        infinite: true,
        speed: 500,
        arrows: true,
        slidesToShow: 4,
        slidesToScroll: 4,
        autoplay: true,
        autoplaySpeed: 1500,
        responsive: [{
            breakpoint: 1024,
            settings: {
                slidesToShow: 4,
                slidesToScroll: 4,
                infinite: true,
                dots: false
            }
        }, {
            breakpoint: 600,
            settings: {
                dots: false,
                arrows: false,
                slidesToShow: 2,
                slidesToScroll: 2
            }
        }, {
            breakpoint: 480,
            settings: {
                dots: false,
                arrows: false,
                slidesToShow: 2,
                slidesToScroll: 2
            }
        }]
    });
    //slider-for  slider-nav 水平點小圖換大圖輪播
    $('.Slider-for').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        speed: 500,
        arrows: false,
        fade: true,
        autoplay: true,
        autoplaySpeed: 2000,
        asNavFor: '.Slider-nav'
    });
    $('.Slider-nav').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        speed: 500,
        asNavFor: '.Slider-for',
        dots: true,
        centerMode: true,
        focusOnSelect: true,
        slide: 'div'
    });
    //remove active class from all thumbnail slides
    $('.Slider-nav .slick-slide').removeClass('slick-active');

    //set active class to first thumbnail slides
    $('.Slider-nav .slick-slide').eq(0).addClass('slick-active');

    // On before slide change match active thumbnail to current slide
    $('.Slider-for').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
        var mySlideNumber = nextSlide;
        $('.Slider-nav .slick-slide').removeClass('slick-active');
        $('.Slider-nav .slick-slide').eq(mySlideNumber).addClass('slick-active');
    });
    //使用lazyLoad
    $('.lazy').slick({
        lazyLoad: 'ondemand',
        slidesToShow: 3,
        slidesToScroll: 1,
        speed: 500
    });
    //單張由右至左
    $('.single-item-rtl').slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        rtl: true
    });
    //多張由右至左
    $('.multiple-items-rtl').slick({
        dots: true,
        infinite: true,
        slidesToShow: 3,
        speed: 500,
        slidesToScroll: 3,
        rtl: true
    });

});
/*-----------------------------------*/
///////////////fatfooter///////////////
/*-----------------------------------*/
$(document).ready(function() {
    $(".btn-fatfooter").click(function() {
        $('.FatFooter>nav>ul>li>ul').slideToggle(function() {
            if ($(this).is(':visible')) {
                // $(".btn-fatfooter").html ("收合");
                $(".btn-fatfooter").removeClass('opnefat');
                $(".btn-fatfooter").attr('name', '收合選單');
            } else {
                // $(".btn-fatfooter").html ("展開");
                $(".btn-fatfooter").addClass('opnefat');
                $(".btn-fatfooter").attr('name', '展開選單');
            }
        });
        $(this).toggleClass('close');
    });
});
/*-----------------------------------*/
///////送select選單內容至select框內///////
/*-----------------------------------*/
$(document).ready(function(e) {
    $('.search-panel .dropdown-menu').find('a').click(function(e) {
        e.preventDefault();
        var param = $(this).attr("href").replace("#", "");
        var concept = $(this).text();
        $('.search-panel span#search_concept').text(concept);
        $('.input-group #search_param').val(param);
    });
});
/*-----------------------------------*/
///////////////fatfooter///////////////
/*-----------------------------------*/
$(function() {

    $(".scrollToTop").click(function() {
        $("html,body").animate({ scrollTop: 0 }, 1000, "easeOutQuint");
        return false;

    });
    $(window).load(function() {
        $(window).bind('scroll resize', function() {
            var $this = $(this);
            var $this_Top = $this.scrollTop();
            //當高度小於130時，關閉區塊
            if ($this_Top < 130) {
                $(".scrollToTop").fadeOut();
            }
            //當高度小於130時，顯示區塊
            if ($this_Top > 130) {
                $(".scrollToTop").fadeIn();
            }
        }).scroll();
    });

});

/*-----------------------------------*/
///////////////megamenu////////////////
/*-----------------------------------*/
//防止menu跳掉
$(document).ready(function() {
    window.prettyPrint && prettyPrint()
    $(document).on('click', '.megamenu .dropdown-menu', function(e) {
        e.stopPropagation()
    })
})
/*-----------------------------------*/
//////////////頁籤選擇//////////////////
/*-----------------------------------*/
 // img ratio
 var imagesHeightInfo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

 var imagesWidthInfo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
 function imgRatio() {
    $('.thumbnailPic').each(function(index, el) {
        var _imgContainer = $(this),
        cWidth = _imgContainer.width(),
        cHeight = _imgContainer.height(),
        ratioC = cWidth / cHeight,
        _img = _imgContainer.find('img');

        var iWidth = $(this).find('img').width(),
        iHeight = $(this).find('img').height(),scaleRatio;
        if(imagesHeightInfo[index] == 0) {
            imagesHeightInfo[index] = iHeight;
        }
        if(imagesWidthInfo[index] == 0) {
            imagesWidthInfo[index] = iWidth;
        }
        var ratioImg = imagesWidthInfo[index] / imagesHeightInfo[index];
        if(cHeight != 0) {
            if (ratioC > ratioImg) {
                // console.log(index+":1");
                scaleRatio = cWidth / imagesWidthInfo[index];
                _img.width(cWidth).height(imagesHeightInfo[index] * scaleRatio).css('top', -.5 * (imagesHeightInfo[index] * scaleRatio - cHeight));
            } else {
                // console.log(index+":2");
                scaleRatio = cHeight / imagesHeightInfo[index];
                _img.height(cHeight).width(imagesWidthInfo[index] * scaleRatio).css('left', -.5 * (imagesWidthInfo[index] * scaleRatio - cWidth));
            }
        }
        // $(this).trigger('load');
    });
}
function tabs() {
    $('.tabs').find('.active').next('.tabContent').show();
    var tw = $('.tabSet').width();
    var tabItemHeight = $('.tabs>h2>a').innerHeight();
    $('.tabs').find('.tabContent').css('top', tabItemHeight);
    $('.tabSet').each(function() {
        tw = $(this).width();
            // console.log(tw);
            var tabContentHeight = $(this).find('.active').next('.tabContent').innerHeight();
            var tabItemLength = $(this).find('h2').length;
            $(this).height(tabContentHeight + tabItemHeight);
            var tabWidth = Math.floor(tw / tabItemLength);
            $(this).find('h2>a').width(tabWidth);
            // console.log("tab寬度:"+tw);
            // console.log("h2:"+tabWidth);
        });
    $(this).parent('h2').siblings().removeClass('active');
    $(this).parent('h2').addClass('active');
    tabContentHeight = $(this).parent('h2').next('.tabContent').innerHeight();
    $(this).parents('.tabSet').height(tabContentHeight + tabItemHeight);
    imgRatio();
    return false;
}
tabs();
var resizeTimer;

jQuery(document).ready(function() {
    $('.tabs>h2>a').focus(tabs);
    $('.tabs>h2>a').click(tabs);
    $(window).on('resize', function(e) {
        // 計時器
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            imgRatio();
            tabs();
        }, 400);
        // 先執行一次
        // imgRatio();

    });

});

//Responsive Display 縮小成手機板時會變成單張輪播
// $('.Single_slider').slick({
//         dots: true, //要不要顯示圓點
//         dotsClass: 'slick-dots',
//         infinite: true,
//         autoplay: true,
//         autoplaySpeed: 3000,
//         slidesToShow: 1,
//         fade: true,
//         slidesToScroll: 1
//     });



// jQuery(document).ready(function(){

//     var resizeTimer;
//     $(window).on("load resize",function(e){
//         clearTimeout(resizeTimer);
//         resizeTimer = setTimeout(function() {
//             var _imgContainer = $('.mp_banner').find('.slick-slide'),
//             cWidth = _imgContainer.width(),
//             cHeight = _imgContainer.height(),
//             ratioC = cWidth/cHeight,
//             _img = _imgContainer.find('img');
//             console.log('cWidth'+ cWidth);
//             console.log('cHeight'+ cHeight);
//             _img.each(function(){
//                 var iWidth = $(this).width(),
//                 iHeight = $(this).height(),
//                 ratioImg = iWidth/iHeight,
//                 scaleRatio;
//                 console.log('iWidth'+ iWidth);
//                 console.log('iHeight'+ iHeight);
//                 if( ratioC > ratioImg ){
//                     scaleRatio = cWidth/iWidth;
//                     $(this).width(cWidth).height(iHeight*scaleRatio).css('top', -.5*(iHeight*scaleRatio-cHeight));
//                 } else {
//                     scaleRatio = cHeight/iHeight;
//                     $(this).height(cHeight).width(iWidth*scaleRatio).css('left', -.5*(iWidth*scaleRatio-cWidth));
//                 }

//             });
//         }, 10);

//     });
//     $(window).trigger('resize');
// });

jQuery(document).ready(function($) {
    var userAgent, ieReg, ie;
    userAgent = window.navigator.userAgent;
    ieReg = /msie|Trident.*rv[ :]*11\./gi;
    ie = ieReg.test(userAgent);

    if (ie) {
        $('.mp_banner .slick-slide').each(function() {
            var $container = $(this),
            imgUrl = $container.find("img").prop("src");
            if (imgUrl) {
                $container.css("backgroundImage", 'url(' + imgUrl + ')').addClass("custom-object-fit");
            }
        });
    }
});