$.mvc.controller.create("events", {
    name: 'events',
	places: false,
	views:["views/events.index.html","views/events.view.html","views/events.set_locations.html","views/events.place.html"], //These are the views we will use with the controller
	
    view:function(id){
		var self = this;
		app.loadPage(this.name, 'view', 'events/view/' + id).done(function(d){
			self.currentEvent = d.vars.event;
		});
    },
	
    init:function(){
       //$.ui.scrollingDivs['events-index'].addPullToRefresh();
	   this.disabledLocations = LocalStore.get('disabledLocations', {});
    },
	
    default:function(){
		var self = this;
		app.loadPage(this.name, 'index', 'events').done(function(d){
			self.places = d.vars.places;
			self.filterIndex();
			self.setActiveBtn();
		});
    },
	
	place:function(id){
		app.loadPage(this.name, 'place', 'events/place/'+id).done(function(){
			//$('#placeevents').listview();
		});
	},
	
	set_locations: function(){
		if(this.places)
			app.loadPage(this.name, 'set_locations', {places:this.places});
	},
	
	filter:'next',
	filterIndex: function(w){
		if(!w)
			w = this.filter;
		var lstr = '', lim = '';
		for(var i in this.disabledLocations) {
			lstr += lim + 'li.location-'+i;
			lim = ',';
		}
		//$(lstr, '#thelist').css('display', 'none');
		//$('#thelist > li').not(lstr).css('display', 'block');
		$('#thelist').children('li').css('display', 'none');
		$('#thelist').children('li.show-'+w).not(lstr).css('display', 'block');
		app.filter = w;
		this.setActiveBtn();
	},
	
	toggleLocation: function(){
		var elements = $('#locationlist').find('.ch-location');
		this.disabledLocations = {};
		var self = this;
		elements.each(function(i, el) {
			if(!el.checked)
				self.disabledLocations[$(el).data('id')] = $(el).data('id');
		});
		LocalStore.set('disabledLocations', this.disabledLocations);
		console.log(this.disabledLocations);
		this.filterIndex();
	},
	
	setActiveBtn:function(){
		var klasse = 'ui-btn-active';
		$('.btn-filter-events.'+klasse).removeClass(klasse);
		$('#btn-'+this.filter+'-events').addClass(klasse);
	},
	
	saveToCalendar:function(){
		if(!this.currentEvent)
			return;
		var e = this.currentEvent;
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
	
});