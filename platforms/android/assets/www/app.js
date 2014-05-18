requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        views: '../views',
		controllers: '../controllers'
    }
});

var AppRouter = BackboneMVC.Router.extend({
	before:function(route){
		window.backDetected = true; //wird komischerweise nur ausgeführt, wenn zurücknavigiert wird. Und genau dafür sollte diese Funktion da sein.
	}
});


app = {
	c: {}, //Controller array
	controllers: {}, //Controllerklassen
	controllerList: ["controllers/main", "controllers/events", "controllers/news"],
	viewType:"text/x-underscore-template",
	requests : [],
	cacheTimes: [],
	serverUrl: 'http://headkino.de/potsdamevents/',
	jsonUrl: 'http://headkino.de/potsdamevents/json/',
	going : {},
	testcode: '',
	viewFileExt: 'js',
	router : new AppRouter(),
	init: function(){
		this.testcode = LocalStore.get('testcode', (Date.now()+'').substr(-4));
		this.baseUrl = document.location.pathname;
		this.baseUrl = this.baseUrl.replace(/\/index\.html/, '');
		var that = this;
		$(document).one('app:controllersLoaded', function(){
			that.updateLayout();
			that.bindEvents();
			Backbone.history.start({pushState: false, root: that.baseUrl});
			if(!window.location.hash) {
				that.route("main/menu");
			} else {
				app.history.push(Backbone.history.fragment);
			}
		});
		this.loadControllers(app.controllerList);
	},
	history:[],
	route:function(url, noTrigger){
		//console.log(app.c);
		var trigger = !noTrigger;
		if(trigger)
			this.history.push(url);
		this.router.navigate(url, {trigger: trigger, replace: false});
	},
	refresh:function(callback){
		var url = Backbone.history.fragment;
		this.refreshing = true;
		this.setCallback(callback);
		this.route(url);
	},
	previous: function(noTrigger){
		if(this.history[this.history.length - 2]) {
			this.history.pop();
			this.route(this.history[this.history.length - 1], noTrigger);
		}
	},
	callback : function(){},
	setCallback:function(callback){
		var self = this;
		this.callback = function(){
			callback(arguments);
			self.callback = function(){};
		}
	},
	render : function(view, d, con){
		var t = this.template('views/'+view);
		if(d && d.vars)
			d = d.vars;
		var temp = _.template(t);
		//console.log(d);
		return temp(d);
	},
	loadPage: function(c, a, url, transition){
		var q = Q.defer();
		if(this.locked) {
			q.resolve();
			return q.promise;
		}
		this.locked = true;
		var params = {};
		if(typeof(transition) == 'object') {
			params = transition;
			transition = false;
		}

		if(!transition)
			transition = 'slide';

		var b = transition[0], back;
		if(back = b == '-') {
			transition = transition.substr(1);
		}
		if(window.backDetected) {
			back = true;
			window.backDetected = false;
		}
		window.reverseTransition = back;
		var self = this; var samePage = false;
		var callback = function(d){
			//console.log($.mobile.activePage.data('appfunction')+' '+c+'.'+a);
			if($.mobile.activePage.data('appfunction') == c+'.'+a) {
				$.mobile.activePage.data('appurl', url);
				app.locked = false;
				q.resolve(d);
				samePage = true;
			}
			var vars = d ? (d.vars ? $.extend(true, {}, d.vars) :$.extend(true, {}, d)) : {};
			$.extend(vars, params);
			//console.log(vars);
			var html = app.render(c+'.'+a, vars); 
			var $con = $('.ui-content', '#'+c+'-'+a);
			//var footer = $('.footer', '#'+c+'-'+a);
			if(self.refreshing) {
				$con.append(html);
				self.callback();
			} else {
				$con[0].innerHTML = html;
			}
			$con.enhanceWithin();
			
			self.refreshing = false;
			if(samePage) {
				app.locked = false;
				return;
			}
			//$.mobile.pageContainer.change will be needed in future versions
			Q($.mobile.changePage('#'+c+'-'+a,{allowSamePageTransition:true,reloadPage:false,changeHash:true,transition:transition, reverse:back}))
			.then(function(){
				$.mobile.activePage.data('appurl', url);
				$.mobile.activePage.data('appfunction', c+'.'+a);
				$('a:hover').blur(); //Damit die Hover Class des gedrückten Buttons entfernt wird Focus genrell clearen
				app.locked = false;
				q.resolve(d);
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
		//app.requests[url] = testData; q.resolve(app.requests[url]); return q.promise;
		//if(this.refreshing) {for(var i = 0; i < 1000; i++){};}
		if(app.requests[url] && !this.refreshing && app.cacheTimes[url] && Date.now() - app.cacheTimes[url] < 5 * 3600000) { //Alle 5 Stunden wird aktualisiert
			track(url);
			q.resolve(app.requests[url]);
		} else {
        	$.getJSON(this.jsonUrl + url + '?testcode='+this.testcode).done(function(d){ app.requests[url] = d; app.cacheTimes[url] = Date.now(); q.resolve(d);});
		}
		return q.promise;
	},
	updateLayout:function(){
		if(!this.header) {
			this.body = $('#wrapper');
			this.header = $('#the_header');
			this.headerContent = $('#header-content');
			this.footerContent = $('#footer-content');
			this.footer = $('#the_footer');
			this.footerHeight = this.footer.height();
			//$('head').append('<style id="layout-style-css"> .ui-content{height:'+height+'px !important;}</style>');
			this.layoutCSS = $('#layout-style-css');
			var self = this;
			$(window).resize(function(){
				self.contentOuter = $('.ui-content').outerHeight() - $('.ui-content').height();
				self.updateLayout();
			});
			if($.os.ios7)
				this.header.addClass('ios7');
			$(window).resize();
			return;
		}
		var hheight = this.header.is(':visible') * this.header.outerHeight(true);
		var fheight = (this.footer.is(':visible')) * this.footer.outerHeight(true);
		if(window.footerAnimating) fheight = 1;
		var height = this.body.height() - hheight - fheight - this.contentOuter + 3;
		this.layoutCSS.html('.ui-content{height:'+height+'px !important;} .app-page{padding-top:'+(hheight - 1)+'px !important;}');
	},
	bindEvents:function(){
		var self = this;
		$.ajaxSetup({
			  "error":function() {
				  app.locked = false;
				  $('.ui-btn-active', app.activePage()).removeClass('ui-btn-active');
				  app.previous(true);
				  var s = 'Es konnte keine Verbindung zum Server hergestellt werden. Bitte überprüfe deine Internetverbindung';
				  if(navigator.notification)
				  	navigator.notification.alert(s, null, 'Kein Internet');
				  else
				  	alert(s);
			  }
		});
		$(document).on('pagebeforechange', function(e, a){
			var toPage = a.toPage;
			if(typeof(a.toPage) == 'string') return;
			var header = $('.header', toPage);
			var footer = $('.footer', toPage);
			if($.os.ios) {
				var dur = 300;
				self.headerContent.fadeOut(dur, function(){
					self.headerContent[0].innerHTML = header[0].innerHTML;
					self.headerContent.fadeIn(dur);
				});
			} else {
				self.headerContent[0].innerHTML = header[0].innerHTML;
			}
			var duration = 350, animating = 'footer';
			window.footerAnimating = true;
			var dir = window.reverseTransition ? 1 : -1;
			if(footer.length > 0) {
				self.footerContent[0].innerHTML = footer[0].innerHTML;
				self.footer[0].style.display = 'block';
				self.footer.animate({'left':0}, duration, function(){
					window.footerAnimating = false;
					self.updateLayout();
				});
			} else { 
				self.footer.animate({'left':(self.footer.width() * dir)+'px'}, duration, function(){
					self.footer[0].style.display = 'none';
					self.updateLayout();
					window.footerAnimating = false;
				});
			}
			self.updateLayout(animating);
		});
		$(document).on('click', 'a[data-rel="back"]', function(){
			window.history.back();
		});

		$(document).on('click', 'a', function(e){
			var href = $(this).attr('href');
			var target = $(this).attr('target');
			var mapRequest = !(href.indexOf('maps:') == -1 && href.indexOf('geo:') == -1);
			if(href && href.indexOf('javascript:') == -1 && href.indexOf('http://') == -1 && !mapRequest) {
				$('.ui-btn-active', app.activePage()).removeClass('ui-btn-active');
				$(this).addClass('ui-btn-active');
				self.route(href);
			}
			if(!target || target != '_system') {
				e.preventDefault();
			} else {
				if(href)
					track(href);
			}
		})
	},
	activePage: function(){
		return $.mobile.activePage;
	},
	activeCon:function(){
		return $('.ui-content', this.activePage());
	},
	getPage:function(id){
		return $('#'+id);
	},
	loadingIndicator:function(){
		
	},
	openBrowser:function(url){
		track(url);
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
	loadControllers: function(urls) {
		var that = this;
		require(urls, function(){
			var views = [], viewNames = [], appc = [];
			var c = 0;
			for(var i in app.controllers) {
				that.controllersLoaded = true;
				app.c[i] = appc[i] = (new app.controllers[i]);
				if(app.c[i].init)
					app.c[i].init();
				for(var j in appc[i].views) {
					views[c] = 'text!'+appc[i].views[j]+'.' + that.viewFileExt;
					viewNames[c] = appc[i].views[j];
					c++;
				}
			}
			require(views, function(data){
				for(var c in views) {
					var id = that.getTemplateID(viewNames[c]);
					$('body').append($("<script type='" + that.viewType + "' id='" + id + "'>" + arguments[c] + "</script>"));
				}
				$(document).trigger('app:controllersLoaded');
			});
		});
	},
	getTemplateID: function(url){
		return url.replace(/\//g, '-').replace(/\./g, '__');
	},
	template: function(url){
		var id = this.getTemplateID(url);
		return document.getElementById(id).innerHTML;
	}
}	

function testLive(){
    var event = document.createEvent('HTMLEvents');
    event.initEvent('deviceready', true, true);
    event.eventName = 'deviceready';
    document.dispatchEvent(event);
}

function track(action){
	var url = app.jsonUrl+'app/track/'+app.testcode+'/?url='+encodeURI(action);
	if(!$.os.fennec)
		$('#tracker').attr('src', url);
};

var detectUA = function($, userAgent) {
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

	