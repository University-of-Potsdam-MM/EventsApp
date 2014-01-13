$.mvc.controller.create("news", {
    name: 'news',
	filter: 'recent',
	newsSources: false,
	views:["views/news.index.html", "views/news.view.html", "views/news.set_sources.html"], //These are the views we will use with the controller

    init:function(){
		this.disabledNews = LocalStore.get('disabledNews', {});
    },
	
	view: function(id){
		app.loadPage(this.name, 'view', 'news/view/' + id, 'slide').done(function(){
			$('.news-text.unchanged').find('a').each(function(){
				$(this).attr('href', 'javascript:app.openBrowser("'+$(this).attr('href')+'")');
			})
			$('.news-text.unchanged').removeClass('unchanged');
		});
	},
	
    default:function(){
		var self = this;
		app.loadPage(this.name, 'index', 'news/index', 'slide').done(function(d){
			self.newsSources = d.vars.newsSources;
		});
    },
	
	set_sources: function(){
		if(this.newsSources)
			app.loadPage(this.name, 'set_sources', {newsSources:this.newsSources});
	},
	
	filterIndex: function(w){
		if(!w)
			w = this.filter;
		var lstr = '', lim = '';
		for(var i in this.disabledNews) {
			lstr += lim + 'li.news-'+i;
			lim = ',';
		}
		//$(lstr, '#thenewslist').css('display', 'none');
		//$('#thenewslist > li').not(lstr).css('display', 'block');
		$('#thenewslist').children('li').css('display', 'none');
		$('#thenewslist').children('li.show-'+w).not(lstr).css('display', 'block');
		this.filter = w;
	},
	
	toggleNews:function(){
		var elements = $('#newslist').find('.ch-news');
		var self = this;
		this.disabledNews = {};
		elements.each(function(i, el) {
			if(!el.checked)
				self.disabledNews[$(el).data('id')] = $(el).data('id');
		});
		LocalStore.set('disabledNews', this.disabledNews);
		this.filterIndex();
	},
});