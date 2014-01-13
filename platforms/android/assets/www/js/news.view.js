app.news = $.extend(app.news, {
	afterView: function(d){
		$('.news-text').find('a').each(function(){
			console.log($(this));
			$(this).attr('href', 'javascript:app.openBrowser("'+$(this).attr('href')+'")');
		});
	},
	
	
});