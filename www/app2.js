var app = new $.mvc.app();
app.setViewType("text/x-underscore-template");
app.controllerList = ["main", "events", "news"];
app.loadControllers(app.controllerList); 

app.ready(function(){
    $.mvc.route("events");
	app.updateLayout();
});
app = $.extend(app, {
	c : $.mvc.controller,
	requests : [],
	jsonUrl: 'http://headkino.de/potsdamevents/json/',
	going : {},
	viewFileExt: 'html',
	render : function(view, d, con){
		var t = $.template('views/'+view);
		if(d && d.vars)
			d = d.vars;
		var temp = _.template(t);
		return temp(d);
	},
	loadPage: function(c, a, url, transition){
		if(this.locked)
			return;
		this.locked = true;
		if(!transition)
			transition = 'slide';
		var b = transition[0], back;
		if(back = b == '-') {
			transition = transition.substr(1);
		}
		var q = Q.defer();
		var callback = function(d){
			var html = app.render(c+'.'+a+'.'+app.viewFileExt, d);
			var $con = $('.ui-content', '#'+c+'-'+a);
			$con[0].innerHTML = html;
			$con.enhanceWithin();
			Q($.mobile.changePage('#'+c+'-'+a,{allowSamePageTransition:true,reloadPage:false,changeHash:true,transition:transition, reverse:back}))
				.then(function(){
					//app.lockTap(-1);
					$.mobile.activePage.data('appurl', url);
					app.locked = false;
					q.resolve(d);
					//app.ids[pageID] = url;
				});
		}
	

		if(url && url != null && typeof(url) == 'string')
			app.get(url).done(callback);
		else
			callback(url);
		return q.promise;
	},
	get: function(url){
		var q = Q.defer();
		if(app.requests[url]) {
			q.resolve(app.requests[url]);
		} else
        	$.getJSON(this.jsonUrl + url).done(function(d){ app.requests[url] = d; q.resolve(d);});
		return q.promise;
	},
	updateLayout:function(){
		var p = $.mobile.activePage;
		var d = $('body');
		console.log(p);
		var header = p.find('.ui-header');
		var footer = p.children('.ui-footer');
		var height = d.height() - header.outerHeight() - footer.outerHeight() - ($('.ui-content').outerHeight() - $('.ui-content').height());
		$('head').append('<style>#'+p.attr('id')+' > .ui-content{height:'+height+'px !important;}</style>');
	},
	openBrowser:function(url){
		try {
			//Für Android
			var ref = navigator.app.loadUrl(url, { openExternal:true });
		} catch (e){
		}
		try {
			//Für iOS
			var ref = window.open(url, '_system'); 
		} catch (e){
			
		}
	}
});

function testLive(){
    var event = document.createEvent('HTMLEvents');
    event.initEvent('deviceready', true, true);
    event.eventName = 'deviceready';
    document.dispatchEvent(event);
}

	