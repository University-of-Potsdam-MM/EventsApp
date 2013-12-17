var app = {
	jsonUrl: 'http://headkino.de/potsdamevents/json/',
    backUrl: 'events/index',
	links : {},
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        this.detailsURL = /events\/view\/(\d+)/
		//$(window).on('hashchange', $.proxy(this.route, this));
		$(document).on('tap', 'a[data-href]', app.tapped);
		$( document ).on( "orientationchange", function( event ) {
			alert( "This device is in " + event.orientation + " mode!" );
		});
        $(document).on('pageload', function(){
			if(app.afterLoad) {
				app.afterLoad();
				delete app.afterLoad;
			}
		});
		$(window).on('navigate', function(e, data){
			console.log(e);
		});
		testLive();
        //$('a').on('click', this.go);
        //app.receivedEvent('thelist');
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        Q(app.get('events')).then(function(d){app.render('index', d)});
    },
	
	route: function(url, changeHash) {
        if(!url) return;
		var d = url.split('/');
		var controller = d[0], action = d[1];
		if(!controller)
			controller = 'events';
		if(!action)
			action = 'index';
		app.links[action] = url;
		//$.mobile.navigate( action + '.html', { url: url });
		$.mobile.changePage(action + ".html",{allowSamePageTransition:true,reloadPage:false,changeHash:changeHash,transition:"slide"});
		
		this.backUrl = url;
		app.afterLoad = function(){
			Q(app.get(url)).then(function(d){app.render(action, d)});
		}
		var match = url.match(app.detailsURL);
		if (match) {
            
		}
        return false;
	},
	
	get: function(url){
		var q = Q.defer();
        $.getJSON(this.jsonUrl + url).done(q.resolve);
		return q.promise;
	},                        
    
    tapped : function(){
        var url = $(this).data('href');
        app.route(url, true);
    },
	
	render: function(v, d){
		var V = v[0].toUpperCase() + v.slice(1);
		if(app['render' + V ])
			app['render' + V ](d);
		var $temp = $('#'+ V + '-template'); 
		if($temp.length) {
			d = d.vars;
			console.log(d);
			var temp = _.template($temp.html());
			$('.ui-content', '#' + v).html(temp(d));
		}
		if(app['after' + V ])
			app['after' + V ](d);
	},
	
	renderIndex: function(d){
        //alert(5);
		console.log('renderIndex');
		d = d.vars;
		//alert(d.events[0].Event.id);
		var parentElement = document.getElementById('thelist');
		var place = -1, epCount = 0, html = '', extra = '';
		for(var i in d.events) {
			var e = d.events[i].Event,
			klasse = 'entry show-all';
			if(e.place_id != place) {
				place = e.place_id;
				epCount = 0;
				html = '<li class="divider" data-role="list-divider"><a data-href="events/place/'+d.events[i].Place.id+'">' + d.events[i].Place.name + '</a></li>';
			} else html = '';
			epCount++;
			if(epCount < 4) {
				klasse += ' show-next';
				extra = '';
			} else
				extra = ' style="display:none" ';
			if(date('d.m.Y') == date('d.m.Y', e.startTime))
				klasse += ' show-today';
			html += '<li'+extra+' class="'+klasse+'"><a data-href="events/view/'+ e.id + '">' + e.name + '<br /><span style="font-size:10px">' + e.DateString + '</span></a></li>';
			//alert(e.name);
			//alert(html);
			$(parentElement).append(html);
			$(parentElement).listview('refresh');
		}
		//$(document).list({ headerSelector : 'li.divider' });
        //$('a', parentElement).click(app.tapped);
	},
	
	afterPlace:function(){
		$('#placeevents').listview();
	},
	
	filterIndex: function(w){
		$('li.entry').not('.show-'+w).fadeOut(300);
		$('li.entry.show-'+w).fadeIn(300);
	}
};

function testLive(){
    var event = document.createEvent('HTMLEvents');
    event.initEvent('deviceready', true, true);
    event.eventName = 'deviceready';
    document.dispatchEvent(event);
}