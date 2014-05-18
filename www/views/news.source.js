<h3><%= newsSource.NewsSource.name %></h3>
<br />
<ul id="sourcenews" class="list" data-role="listview" >
	<% var source = -1, epCount = 0, html = '', extra = '', allHtml = '', img = '';
		_.each(news, function(n, i) {
			var e = n.News,
			klasse = 'entry show-all show-recent news-'+n.NewsSource.id;
			epCount++;
			%><li<%=extra%> class="<%=klasse%>">
				<a href="news/view/<%= e.id %>"><%= e.headline %><br />
					<span style="font-size:12px"><%= e.description %></span>
					<br />
					<span style="font-size:10px"><%= e.DateString %></span>
				</a>
			</li><%
		}); %>
</ul>