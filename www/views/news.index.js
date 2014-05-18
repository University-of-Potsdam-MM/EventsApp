<ul id="thenewslist" class="list" data-role="listview">
	<% var source = -1, epCount = 0, html = '', extra = '', allHtml = '', img = '';
		_.each(news, function(n, i) {
			var e = n.News,
			klasse = 'entry show-all show-recent news-'+n.NewsSource.rank;
			if(e.source_id != source) {
				source = e.source_id;
				epCount = 0;
				%><li class="source-news-li up-divider show-all show-recent news-<%=news[i].NewsSource.rank%>">
					<a class="source-news-li-a ui-btn ui-btn-icon-right ui-icon-carat-r" href="news/source/<%= n.NewsSource.id%>">
						<%= n.NewsSource.name %>
					</a>
				</li>
			<% } 
			if(epCount < 4) {
			epCount++;
			%><li<%=extra%> class="<%=klasse%>">
				<a href="news/view/<%= e.id %>"><%= e.headline %><br />
					<span style="font-size:12px"><%= e.description %></span>
					<br />
					<span style="font-size:10px"><%= e.DateString %></span>
				</a>
			</li><% }
		}); %>
</ul>


