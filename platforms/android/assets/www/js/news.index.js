app.news = $.extend(app.news, {
	filter: 'recent',
	renderIndex: function(d){
		d = d.vars;
		var parentElement = document.getElementById('thenewslist');
		this.disabledNews = LocalStore.get('disabledNews', {});
		var source = -1, epCount = 0, html = '', extra = '', allHtml = '', img = '';
		parentElement.innerHTML = '';
		for(var i in d.news) {
			var e = d.news[i].News,
			klasse = 'entry show-all show-recent news-'+d.news[i].NewsSource.id;
			if(e.source_id != source) {
				source = e.source_id;
				epCount = 0;
				html = '<li class="divider show-all show-recent news-'+d.news[i].NewsSource.id+'" data-role="list-divider">' + d.news[i].NewsSource.name + '</li>';
			} else html = '';
			epCount++;
			html += '<li'+extra+' class="'+klasse+'"><a data-href="news/view/'+ e.id + '">'+ e.headline + '<br /><span style="font-size:10px">' + e.DateString + '</span></a></li>';
			//alert(e.name);
			//alert(html);
			allHtml += html;
		}
		parentElement.innerHTML += allHtml;
		$(parentElement).listview('refresh');
		var newsList = document.getElementById('newslist');
		if(newsList.dataset.init)
			return;
		allHtml = '';
		for(var i in d.newsSources) {
			var checked = !this.disabledNews[i] ? ' checked="checked"' : '';
			html = '<input type="checkbox" class="ch-news" onchange="app.news.toggleNews()" data-id="'+i+'" name="location-'+i+'" id="location-'+i+'"'+checked+' /><label for="location-'+i+'">' + d.newsSources[i] + '</label>';
			allHtml += html;
		}
		newsList.innerHTML = allHtml;
		newsList.dataset.init = true;
		//$(locationList).controlgroup('refresh');
		$('#newslistcontainer').page();
		this.filterIndex();
	},
	
	toggleNews:function(){
		var elements = $('#newslist').find('.ch-news');
		app.news.disabledNews = {};
		elements.each(function(i, el) {
			if(!el.checked)
				app.news.disabledNews[$(el).data('id')] = $(el).data('id');
		});
		LocalStore.set('disabledNews', app.news.disabledNews);
		app.news.filterIndex();
	},
	
	afterIndex:function(){
		this.disabledNews = LocalStore.get('disabledNews', {});
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
	}
});