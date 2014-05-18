app.controllers.news = BackboneMVC.Controller.extend({
    name: 'news',
	filter: 'recent',
	newsSources: false,
	views:["views/news.index", "views/news.view", "views/news.set_sources", "views/news.source"], //These are the views we will use with the controller

    init:function(){
		this.disabledNews = LocalStore.get('disabledNews', {});
    },
	
	view: function(id){
		app.loadPage(this.name, 'view', 'news/view/' + id, 'slide').done(function(){
			$('.news-text.unchanged').find('a').each(function(){
				$(this).attr('href', 'javascript:app.openBrowser("'+$(this).attr('href')+'")');
			})
			$('.news-text.unchanged').removeClass('unchanged');
			app.activeCon().scrollTop(0);
		});
	},
	
    index:function(){
		var self = this;
		app.loadPage(this.name, 'index', 'news/index', 'slide').done(function(d){
			self.newsSources = d.vars.newsSources;
			self.filterIndex();
			self.addPullToRefresh();
		});
    },
	
	set_sources: function(){
		if(this.newsSources) {
			app.loadPage(this.name, 'set_sources', {newsSources:this.newsSources});
			track('news/set_sources/');
		} else {
			app.route('news/index');
		}
	},
	
	source: function(id){
		app.loadPage(this.name, 'source', 'news/source/'+id).done(function(){
			
		});
	},
	
	filterIndex: function(w){
		if(!w)
			w = this.filter;
		var lstr = '', lim = '';
		//console.log(this.disabledNews);
		for(var i in this.disabledNews) {
			lstr += lim + 'li.news-'+i;
			lim = ',';
		}
		$('#thenewslist').children('li').css('display', 'none');
		//console.log('li.show-'+w); console.log(lstr); console.log($('#thenewslist', app.getPage('news-index')).children('li'));
		$('#thenewslist').children('li.show-'+w).not(lstr).css('display', 'block');
		this.filter = w;
	},
	
	addPullToRefresh:function(){
		app.activeCon().pullToRefresh({
			refresh: function (callback) {
				app.refresh(callback);//.done(callback);
			}
		});
	},
	
	toggleNews:function(it){
		var elements = $('#newslist').find('.ch-news');
		track('newssources/toggle/'+$(it).data('id')+'/'+it.checked);
		var self = this;
		this.disabledNews = {};
		elements.each(function(i, el) {
			if(!el.checked)
				self.disabledNews[$(el).data('id')] = $(el).data('id');
		});
		LocalStore.set('disabledNews', this.disabledNews);
	},
});