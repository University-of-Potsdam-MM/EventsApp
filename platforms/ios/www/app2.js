var app = new $.mvc.app();
app.setViewType("text/x-underscore-template");
app.controllerList = ["main", "events", "news"];
app.loadControllers(app.controllerList); 

app.ready(function(){
	app.updateLayout();
	app.bindEvents();
    $.mvc.route("events");
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
		var self = this;
		var q = Q.defer();
		var callback = function(d){
			var html = app.render(c+'.'+a+'.'+app.viewFileExt, d);
			var $con = $('.ui-content', '#'+c+'-'+a);
			//var footer = $('.footer', '#'+c+'-'+a);
			$con[0].innerHTML = html;
			$con.enhanceWithin();
			//$.mobile.pageContainer.change will be needed in future versions
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
		if(!this.header) {
			this.body = $('#wrapper');
			this.header = $('#the_header');
			this.footer = $('#the_footer');
			//$('head').append('<style id="layout-style-css"> .ui-content{height:'+height+'px !important;}</style>');
			this.layoutCSS = $('#layout-style-css');
			var self = this;
			$(window).resize(function(){
				self.contentOuter = $('.ui-content').outerHeight() - $('.ui-content').height();
				self.updateLayout();
			});
			$(window).resize();
			return;
		}
		var hheight = this.header.is(':visible') * this.header.outerHeight();
		var fheight = this.footer.is(':visible') * this.footer.outerHeight();
		
		var height = this.body.height() - hheight - fheight - this.contentOuter + 3;
		this.layoutCSS.html('.ui-content{height:'+height+'px !important;}');
	},
	bindEvents:function(){
		var self = this;
		$(document).on('pagebeforechange', function(e, a){
			var toPage = a.toPage;
			if(typeof(a.toPage) == 'string') return;
			var header = $('.header', toPage);
			var footer = $('.footer', toPage);
			self.header[0].innerHTML = header[0].innerHTML;
			if(footer.length > 0) {
				self.footer[0].innerHTML = footer[0].innerHTML;
				self.footer[0].style.display = 'block';
			} else
				self.footer[0].style.display = 'none';
			self.updateLayout();
		});
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

	