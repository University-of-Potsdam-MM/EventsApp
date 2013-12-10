var app = {
	jsonUrl: 'http://headkino.de/potsdamevents/json/',
    backUrl: 'events/index',
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
        $(document).on('pageload', function(){
                       if(app.afterLoad) {
                            app.afterLoad();
                            delete app.afterLoad;
                       }
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
        app.loadList();
    },
	
	route: function(url, changeHash) {
        if(!url) return;
		var d = url.split('/');
		var controller = d[0], action = d[1];
		if(!controller)
			controller = 'events';
		if(!action)
			action = 'index';
		$.mobile.changePage(action + ".html",{allowSamePageTransition:true,reloadPage:false,changeHash:changeHash,transition:"slide"});
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
    // Update DOM on a Received Event
    loadList: function() {
        //alert(this.jsonUrl);
		$.getJSON(this.jsonUrl + 'events', this.renderIndex);
    },
                               
    getEvent: function(id){
		var q = Q.defer();
        $.getJSON(this.jsonUrl + 'events/view/' + id).done(q.resolve);
		return q.promise;
    },
    
    tapped : function(){
        var url = $(this).data('href');
        app.route(url, true);
    },
	
	render: function(v, d){
		v = v[0].toUpperCase() + v.slice(1);
		app['render' + v ](d);
		//app['render' + 
	},
	
	renderIndex: function(d){
        //alert(5);
            d = d.vars;
			//alert(d.events[0].Event.id);
            var parentElement = document.getElementById('thelist');
			var place = -1;
			for(var i in d.events) {
				var e = d.events[i].Event;
				var html = '<li><a data-href="events/view/'+ e.id + '">' + e.name + '<br /><span style="font-size:10px">' + e.DateString + '</span></a></li>';
				if(e.place_id != place) {
					place = e.place_id;
					html = '<li data-role="list-divider">' + d.events[i].Place.name + '</li>' + html;
				}
				//alert(e.name);
				//alert(html);
				$(parentElement).append(html);
				$(parentElement).listview('refresh');
			}
        //$('a', parentElement).click(app.tapped);
	},
	
	renderView: function(d){
		d = d.vars;
		var e = d.event.Event;
		$('#headtitle').text(e.name);
	}
};

function testLive(){
    var event = document.createEvent('HTMLEvents');
    event.initEvent('deviceready', true, true);
    event.eventName = 'deviceready';
    document.dispatchEvent(event);
}