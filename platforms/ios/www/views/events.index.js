<ul id="thelist" data-role="listview" class="list event-list">
<%  var place = -1;
	_.each(events, function(event) { 
			var e = event.Event,
			klasse = 'entry show-all location-'+event.Place.id;
			if(e.place_id != place) {
				place = e.place_id;
				epCount = 0;
				%>
				<li class="up-divider place-events-li show-all show-next show-today location-<%= event.Place.id %>">
					<a class="place-events-li-a" href="events/place/<%= event.Place.id%>">
						<%= event.Place.name %>
					</a>
				</li><%
			}
			epCount++;
			if(epCount < 4) {
				klasse += ' show-next';
				extra = '';
			} else
				extra = ' style="display:none" ';
			if(date('d.m.Y') == date('d.m.Y', e.startTime))
				klasse += ' show-today';
			img = e.pic_square ? '<img class="event-thumb" src="'+ e.pic_square + '" />' : '';
			marked = going[e.id] ? '<br /><span class="relative floatL vorgemerkt">Vorgemerkt</span>' : '';
			%>
				<li<%=extra%> class="<%=klasse%>"><a href="events/view/<%= e.id %>">
					<%= img %>
					<div class="event-caption">
						<span class="event-title"><%=e.name %></span>
						<br />
						<span class="event-time"><%= e.DateString + marked %></span>
					</div>
				</a>
				</li>
	<% }); %>
</ul>
	