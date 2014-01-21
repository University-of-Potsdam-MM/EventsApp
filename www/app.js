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
	},
	detectUA: function($, userAgent) {
		$.os = {};
		$.os.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false;
		$.os.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false;
		$.os.androidICS = $.os.android && userAgent.match(/(Android)\s4/) ? true : false;
		$.os.ipad = userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false;
		$.os.iphone = !$.os.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false;
		$.os.ios7 = userAgent.match(/(iPhone\sOS)\s([7_]+)/) ? true : false;
		$.os.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false;
		$.os.touchpad = $.os.webos && userAgent.match(/TouchPad/) ? true : false;
		$.os.ios = $.os.ipad || $.os.iphone;
		$.os.playbook = userAgent.match(/PlayBook/) ? true : false;            
		$.os.blackberry10 = userAgent.match(/BB10/) ? true : false;
		$.os.blackberry = $.os.playbook || $.os.blackberry10|| userAgent.match(/BlackBerry/) ? true : false;
		$.os.chrome = userAgent.match(/Chrome/) ? true : false;
		$.os.opera = userAgent.match(/Opera/) ? true : false;
		$.os.fennec = userAgent.match(/fennec/i) ? true : userAgent.match(/Firefox/) ? true : false;
		$.os.ie = userAgent.match(/MSIE 10.0/i) ? true : false;
		$.os.ieTouch = $.os.ie && userAgent.toLowerCase().match(/touch/i) ? true : false;
		$.os.supportsTouch = ((window.DocumentTouch && document instanceof window.DocumentTouch) || 'ontouchstart' in window);
		//features
		$.feat = {};
		var head = document.documentElement.getElementsByTagName("head")[0];
		$.feat.nativeTouchScroll = typeof(head.style["-webkit-overflow-scrolling"]) !== "undefined" && ($.os.ios||$.os.blackberry10);
		$.feat.cssPrefix = $.os.webkit ? "Webkit" : $.os.fennec ? "Moz" : $.os.ie ? "ms" : $.os.opera ? "O" : "";
		$.feat.cssTransformStart = !$.os.opera ? "3d(" : "(";
		$.feat.cssTransformEnd = !$.os.opera ? ",0)" : ")";
		if ($.os.android && !$.os.webkit)
			$.os.android = false;


	}
});

function testLive(){
    var event = document.createEvent('HTMLEvents');
    event.initEvent('deviceready', true, true);
    event.eventName = 'deviceready';
    document.dispatchEvent(event);
}

	