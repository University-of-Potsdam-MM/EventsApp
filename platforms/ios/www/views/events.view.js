<% if (event.Event.pic) { %>
  <img class="event-image" height="100" src="<%= event.Event.pic %>" />
<% } %>
<div class="floatR right-event-detail">
	<div <% if(!going[event.Event.id]) { %>style="display:none" <% } %>class="clear floatR" id="savedInCal<%=event.Event.id%>">
		<span class="going-check">
			<span class="ui-btn-icon-notext ui-icon-check"></span>
		</span>
		<span class="s-font floatR">Vorgemerkt</span> 
	</div>
<% if(event.Event.ticket_uri && false) { %>
	<div class="buy-ticket-link">
		<a onclick="app.openBrowser('<%=event.Event.ticket_uri%>')">Tickets kaufen</a>
	</div>
<% } %>
</div>
<h1><%= event.Event.name %></h1>
<% var ds = event.Event.DateString.replace(/\|/, '<img style="vertical-align:-2px;" src="img/clock.png" />') %>
<p>
	<img style="vertical-align:-2px;" src="img/cal.png" /> 
	<strong><%= ds %> Uhr</strong>
	<% if(!going[event.Event.id]) { %>
		<br />
		<a id="saveInCal<%=event.Event.id%>" class="button" data-role="button" onclick="app.c.events.saveToCalendar()">In Kalender speichern</a>
	<% } %>
</p>
<% 
var description = event.Event.description;
var d = description.split(' '), lim = 50;
if(d.length - lim > 25) {
	var d2 = d.splice(lim, d.length - lim);
	%><p>
		<%= d.join(' ') %>&nbsp;<span id="showMore<%=event.Event.id%>" style="display:none"><%= d2.join(' ') %></span>
		<span id="showMoreBtn<%=event.Event.id%>">... <a href="javascript:;" onclick="$('#showMore<%=event.Event.id%>, #showMoreBtn<%=event.Event.id%>').toggle();">
			mehr anzeigen</a>
		</span>
	</p>
<% } else { %>
	<p><%= description %></p>
<% } %>
<br />
<div>
	<strong>
		<%=event.Place.name%><br />
		<%=event.Place.adresse%><br />
		<%=event.Place.plz%> <%=event.Place.ort%><br />
		<% if($.os.ios) { %>
			<a href="maps:q=<%=event.Place.lat%>,+<%=event.Place.lng%>" target="_system">Auf Karte anzeigen</a>
		<% } else if($.os.android) { %>
			<a target="_system" href="geo:<%=event.Place.lat%>,+<%=event.Place.lng%>?q=<%=event.Place.name%>, <%=event.Place.adresse%>, <%=event.Place.plz%> <%=event.Place.ort%>">Auf Karte anzeigen</a>
		<% } else { %>
			<a target="_system" href="http://maps.google.com/?q=<%=event.Place.lat%>,+<%=event.Place.lng%>+(<%=event.Place.name%>)">Auf Karte anzeigen</a>
		<% } %>
	</strong>
</div>
