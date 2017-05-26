$(function(){
	$(window).scroll(function(){
		var headerIndex = $('.headerIndex');
		var backTop = $("#back-top");
		
		var sc=$(window).scrollTop();

		if(sc >= 500){
			headerIndex.addClass('headerFix');
		}else{
			headerIndex.removeClass('headerFix');
		}

		if(sc >= 200){
			backTop.fadeIn();
		}else{
			backTop.fadeOut();
		}
	})

	$("#back-top").click(function(){
		$('html,body').animate({scrollTop:0},'slow','swing');
		
	})
})