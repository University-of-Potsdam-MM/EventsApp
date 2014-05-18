app.controllers.events = BackboneMVC.Controller.extend({
    name: 'events',
	places: false,
	views:["views/events.index","views/events.view","views/events.set_locations","views/events.place"], //These are the views we will use with the controller
	
    view:function(id){
		var self = this;
		app.loadPage(this.name, 'view', 'events/view/' + id, {going:LocalStore.get('going', {})}).done(function(d){
			if(d)
				self.currentEvent = d.vars.event;
			app.activeCon().scrollTop(0);
		});
    },
	
    init:function(){
       //$.ui.scrollingDivs['events-index'].addPullToRefresh();
	   this.going = LocalStore.get('going');
	   this.disabledLocations = LocalStore.get('disabledLocations', {});
    },
	
    index:function(filter){
		var self = this;
		this.filter = filter;
		app.loadPage(this.name, 'index', 'events', {going:LocalStore.get('going', {})}).done(function(d){
			if(!d) return;
			self.places = d.vars.places;
			self.filterIndex();
			self.setActiveBtn();
			//self.stickListDividers();
			self.addPullToRefresh();
		});
    },
	
	place:function(id){
		app.loadPage(this.name, 'place', 'events/place/'+id).done(function(){
			//$('#placeevents').listview();
		});
	},
	
	set_locations: function(){
		if(this.places) {
			app.loadPage(this.name, 'set_locations', {places:this.places, disabledLocations:this.disabledLocations}).done(function(){
				
			});
		}
	},
	
	filter:'',
	filterIndex: function(w){
		if(!this.filter)
			this.filter = 'next';
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
		$('#thelist').trigger('resize');
		$('#thelist').trigger('resize');
		this.filter = w;
		this.setActiveBtn();
		window.setTimeout(function(){$(window).trigger('resize');}, 10);
	},
	
	addPullToRefresh:function(){
		app.activeCon().pullToRefresh({
			refresh: function (callback) {
				app.refresh(callback);//.done(callback);
			}
		});
	},
	
	stickListDividers: function(){
		return;
		$('body').stacks({
			body: '.ui-content', // This is the container that will house your floating element.
			title: '.up-divider', // The identifier for the elements you want to be fixed, can be any type of jQuery selector
			margin: 0,
			offset: 0,
			fixAndroid: $.os.android,
			touch: $.os.ios,
			fixiOS: $.os.ios
		})
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
		//this.filterIndex();
	},
	
	setActiveBtn:function(){
		var klasse = 'ui-btn-active';
		$('.btn-filter-events.'+klasse).removeClass(klasse);
		$('#btn-'+this.filter+'-events', app.footer).addClass(klasse);
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