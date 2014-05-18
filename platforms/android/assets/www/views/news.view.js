<h2><%= news.News.headline %></h2>
<div class="news-text unchanged"><%= news.News.text %></div>
<br />
<br />
<div class="floatL clear">
	<div>
		<a onclick="app.openBrowser('<%=news.News.link%>')">Auf Website lesen</a>
	</div>
	<div>Veröffentlicht: <%= news.News.DateString %> Uhr</div>
</div>


