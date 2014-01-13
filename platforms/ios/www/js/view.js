 $.extend(app, {

    saveEventToCalendar:function(){
		if(!app.currentEvent)
			return;
		var e = app.currentEvent;
		var saved = false;

		window.plugins.calendar.createEvent(e.Event.name, e.Place.name, e.Event.description, new Date(parseInt(e.Event.startTime) * 1000), new Date((parseInt(e.Event.startTime) + 3600) * 1000 ),
			function(m){
				navigator.notification.alert(e.Event.name + ' am ' + e.Event.DateString + ' wurde deinem Kalender hinzugefügt.', null, 'Gespeichert');
				LocalStore.set('going', e.Event.id, e.Event.id);
				$('#savedInCal'+e.Event.id).show();
				saved = true;
			},
			function(m){
				if(m != 'User cancelled')
				navigator.notification.alert("Das Event konnte nicht in deinem Kalender gespeichert werden. Bitte überprüfe in den Einstellungen ob du der App den Zugriff auf deinen Kalender erlaubst.", null, 'Fehler');
				saved = false;
			}
		);
	},
	
	afterView:function(d){
		app.currentEvent = d.event;
		$('#view').page();
	},

});
