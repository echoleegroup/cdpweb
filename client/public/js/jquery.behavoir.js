(function(){
	jQuery(function(){
    	//search block
    	$('.RNmenu .link.search').click(function(){
    		var _target = $('.searchType');
    		
    		if (_target.is('.searchOpen')) {
    			_target.removeClass('searchOpen');
    		} else {
    			_target.addClass('searchOpen');
    		}
    		
    		$('.searchType .btnClose').click(function(){
    			_target.removeClass('searchOpen');
    		});
    	});
    	
    	//fatfooter
    	$( ".sildeCtrlbtn" ).click(function(){
    		
    		$('.fatfooter>nav>ul>li>ul').slideToggle(function(){
    			if($(this).is(':visible')){	document.getElementById("sildeCtrlbtn").value="收合";}
    			else{document.getElementById("sildeCtrlbtn").value="展開";}
    		});
    		$(this).toggleClass('close');
    	});
    	
    	
		//TopMegaMenu				
		$(function() {
			window.prettyPrint && prettyPrint()
			$(document).on('click', '.yamm .dropdown-menu', function(e) {
				e.stopPropagation()
			})
		})
		
    	//scrollup
    	$(".scrollup").click(function(){
    		$("html,body").stop(true,false).animate({scrollTop:0},700); //設定回頁面頂端
    		return false;	
    	});
    	$(window).scroll(function() {
    		if ( $(this).scrollTop() > 250){
                $('.scrollup').fadeIn("fast"); //設定大於250px才顯示浮層
            } else {
            	$('.scrollup').stop().fadeOut("fast");
            }
        });
    	
    	
    	
    	$('#fontsize').click(function() {
    		var m = $('.m-main');
    		
    		var fontSize = 'M';
    		if (m.hasClass('fontXL')) {
    			fontSize = 'XL';
    		} else if (m.hasClass('fontL')) {
    			fontSize = 'L';
    		} else {
    			fontSize = 'M';
    		}
    		
    		m.removeClass('fontXL');
    		m.removeClass('fontL');
    		$(this).removeClass('fontXL');
    		$(this).removeClass('fontL');
    		$(this).removeClass('font');
    		
    		if (fontSize == 'XL') {
    			$(this).addClass('font');
    		} else if (fontSize == 'L') {
    			m.addClass('fontXL');
    			$(this).addClass('fontXL');
    		} else if (fontSize == 'M') {
    			m.addClass('fontL');
    			$(this).addClass('fontL');
    		}
    		
    		return false;
    	});
    	
    	
    });
})(jQuery);
