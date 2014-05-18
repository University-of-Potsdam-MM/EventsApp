<div id="locationlist" class="list"><% _.each(places, function(place, i) {
	var checked = !disabledLocations[i] ? ' checked="checked"' : '';
	%>
    <div class="grid">
		<div class="col2 floatL fullWidth">
			<input type="checkbox" class="ch-location toggle" onchange="app.c.events.toggleLocation()" data-id="<%=i%>" name="location-<%=i%>" id="location-<%=i%>"<%=checked%> />
			<label for="location-<%=i%>" data-on="" data-off="">
				<span><%=place%></span>
			</label>
		</div>
    </div>
<%
});
%></div>