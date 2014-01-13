var app = {
	controllerList:["main", "events", "news"],
	jsonUrl: 'http://headkino.de/potsdamevents/json/',
    backUrl: 'events/index',
	links : {},
	disabledLocations : {},
	filter : 'next',
	defaultController : 'events',
	going : {},
	ids: {},
	requests: {},
	tapLocked:0,
    // Application Constructor
    initialize: function() {
		this.loadControllers();
        this.bindEvents();
    },
	
	onPageLoad : function(){
		var q = Q.defer();
		if(app.afterLoad) {
			app.afterLoad().done(q.resolve);
			delete app.afterLoad;
		} else q.resolve();
		return q.promise;
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
        //$(document).on('pageload', app.onPageLoad);
		$(window).on('navigate', function(e, data){
			app.setActiveBtn();
		});
		testLive();
        //$('a').on('click', this.go);
        //app.receivedEvent('thelist');
    },
	initLayout: function(){
		var p = $.mobile.activePage;
		var d = $('body');
		console.log(p);
		var header = p.find('.ui-header');
		var footer = p.children('.ui-footer');
		var height = d.height() - header.outerHeight() - footer.outerHeight() - ($('.ui-content').outerHeight() - $('.ui-content').height());
		$('head').append('<style>#'+p.attr('id')+' > .ui-content{height:'+height+'px !important;}</style>');
	},
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		if(window.device)
			alert(window.device.platform)
		app.going = LocalStore.get('going', {});
        Q(app.get('events')).then(function(d){app.render('index', d)}).done(app.initLayout);
    },
	
	route: function(url, refreshing) {
        if(!url) return;
		var d = url.split('/');
		var controller = d[0], action = d[1];
		if(!controller)
			controller = app.defaultController;
		if(!action)
			action = 'index';
		if(controller == app.defaultController) {
			var cls = '';
		} else {
			action = controller + '.' + action;
			var cls = controller;
		}
		var pageID = cls+'-'+action;
		var transition = 'slide';
		app.afterLoad = function(){
			var q = Q.defer();
			//alert(app.ids[pageID] + ' - ' +url);
			if(app.ids[pageID] == url && !refreshing) {
				q.resolve();
				return q.promise;
			}
			if(app.requests[url] && !refreshing) {
				app.render(action, app.requests[url]);
				q.resolve();
				return q.promise;
			}
			Q(app.get(url)).then(function(d){app.render(action, d)}).then(q.resolve);
			return q.promise;
		}
		var filename = window.location.pathname;
		Q($.mobile.loadPage( action + '.html' ))
			.then(app.onPageLoad)
			.then(function(){
				if(filename.indexOf(action + '.html') < 0)
					$.mobile.changePage(action + ".html",{allowSamePageTransition:true,reloadPage:false,changeHash:true,transition:transition})
			}).done(function(){
				app.lockTap(-1);
				$.mobile.activePage.data('appurl', url);
				app.ids[pageID] = url;
			});
        return false;
	},
	
	get: function(url){
		var q = Q.defer();
		if(app.requests[url]) {
			q.resolve(app.requests[url]);
		} else
        	$.getJSON(this.jsonUrl + url).done(function(d){ app.requests[url] = d; q.resolve(d);});
		return q.promise;
	},                        
    
	lockTap: function(value, now){
		if(value > 0) {
			app.tapLocked += value;
			if(app.tapLockTimer) {
				window.clearTimeout(app.tapLockTimer);
				app.tapLocked--;
			}
			app.tapLockTimer = window.setTimeout(function(){
				app.tapLockTimer = false;
				app.lockTap(-1, true);
			}, 500);
		} else {
			app.tapLocked += value;
			if(app.tapLocked < 0)
				app.tapLocked = 0;	
		}
	},
	
    tapped : function(){
		if(app.tapLocked)
			return;
		app.lockTap(2);
        var url = $(this).data('href');
		var old = $.mobile.activePage.data('appurl');
		if(old != url) {
        	app.route(url, true);
		}
		else {
			var p = $(this).parents('.ui-panel');
			if(p.length) {
				p.panel("close");
			}
			app.lockTap(-1);
		}
    },
	
	refresh:function(url){
		app.route(url, true);
	},
	
	render: function(v, d){
		if(v.indexOf('.') > -1) {
			var controller = app[v.split('.')[0]], c = v.split('.')[0] + '-';
			v = v.split('.')[1];
		} else {
			var controller = app, c = '';
		}
		var V = v[0].toUpperCase() + v.slice(1);
		if(controller['render' + V ])
			controller['render' + V ](d);
		var $temp = $('#'+ c + V + '-template'); 
		if($temp.length) {
			d = d.vars;
			var temp = _.template($temp.html());
			$('.ui-content', '#' + c + v).html(temp(d));
		}
		if(controller['after' + V ])
			controller['after' + V ](d);
	},
	
	renderIndex: function(d){
		console.log('renderIndex');
		d = d.vars;
		var parentElement = document.getElementById('thelist');
		this.disabledLocations = LocalStore.get('disabledLocations', {});
		this.going = LocalStore.get('going', {});
		var place = -1, epCount = 0, html = '', extra = '', allHtml = '', img = '', going = '';
		parentElement.innerHTML = '';//'<li class="show-next show-all show-today pull-loader"><div class="pull-loader-con"><img class="pull-loader-spinner" src="img/spinner.gif" alt="" /><img class="pull-loader-arrow" src="img/pullarrow.png" alt="" /></div></li>';
		for(var i in d.events) {
			var e = d.events[i].Event,
			klasse = 'entry show-all location-'+d.events[i].Place.id;
			if(e.place_id != place) {
				place = e.place_id;
				epCount = 0;
				html = '<li class="divider place-events-li show-all show-next show-today location-'+d.events[i].Place.id+'" data-role="list-divider"><a class="place-events-li-a ui-btn-icon-right ui-icon-carat-r" data-href="events/place/'+d.events[i].Place.id+'">' + d.events[i].Place.name + '</a></li>';
			} else html = '';
			epCount++;
			if(epCount < 4) {
				klasse += ' show-next';
				extra = '';
			} else
				extra = ' style="display:none" ';
			if(date('d.m.Y') == date('d.m.Y', e.startTime))
				klasse += ' show-today';
			img = e.pic_square ? '<img class="ui-li-event-thumb" src="'+ e.pic_square + '" />' : '';
			going = this.going[e.id] ? '<br /><span class="relative floatL">Vorgemerkt</span>' : '';
			html += '<li'+extra+' class="'+klasse+'"><a data-href="events/view/'+ e.id + '">'+ img + e.name + '<br /><span style="font-size:10px">' + e.DateString + going + '</span></a></li>';
			//alert(e.name);
			//alert(html);
			allHtml += html;
		}
		parentElement.innerHTML += allHtml;
		$(parentElement).listview('refresh');
		
		var locationList = document.getElementById('locationlist');
		if(locationList.dataset.init) 
			return;
		allHtml = '';
		for(var i in d.places) {
			var checked = !this.disabledLocations[i] ? ' checked="checked"' : '';
			html = '<input type="checkbox" class="ch-location" onchange="app.toggleLocation()" data-id="'+i+'" name="location-'+i+'" id="location-'+i+'"'+checked+' /><label for="location-'+i+'">' + d.places[i] + '</label>';
			allHtml += html;
		}
		locationList.innerHTML = allHtml;
		locationList.dataset.init = true;
		//$(locationList).controlgroup('refresh');
	},
	
	afterIndex : function(){
		$('#locationlistcontainer').page();
		this.filterIndex();
		var timer, lockScroll = true, touched = false;
		/*var $uiContent = $('.ui-content');
		var $pullLoader = $('.pull-loader', $uiContent), $pullLoaderArrow = $('.pull-loader-arrow', $uiContent), $pullLoaderSpinner = $('.pull-loader-spinner', $uiContent);
		//$pullLoader.height($(document).height());
		var pullLimit = 70, overLimit = false, limitPassed = false, deg1 = 0, deg2 = -180;
		var pullh = ptop = 300;//screen.availHeight;
		pullh += pullLimit - 30;
		$pullLoader.css('padding-top', ptop);
		//$uiContent.animate({scrollTop: (pullh)}, function(){lockScroll = false});
		var scrolled = function(){
			var s = $uiContent.scrollTop();
			limitPassed = false;
			if(s < pullh - pullLimit) {
				if(!overLimit) {
					limitPassed = true
					overLimit = true;
					deg1 = 0;
					deg2 = -180;
				}
			} else {
				if(overLimit) {
					limitPassed = true
					overLimit = false;
					deg1 = -180;
					deg2 = 0;
				}
			}
			if(limitPassed)
				$({deg: deg1}).animate({deg: deg2}, {
					duration: 200,
					step: function(now) {
						$pullLoaderArrow.css({
							transform: 'rotate(' + now + 'deg)'
						});
					}
				});
			if(lockScroll) return;
			window.clearTimeout(timer);
			var timerCallback = function(){
				if( s < pullh && !touched) {
					lockScroll = true;
					if(s < pullh - pullLimit) {
						$uiContent.animate({scrollTop: (pullh - pullLimit + 1)}, function(){
							$pullLoaderArrow.hide();
							$pullLoaderSpinner.show();
							Q(app.refresh('events/index')).done(function(){
								//alert(1);
								$uiContent.animate({scrollTop: (pullh)}, function(){
									$pullLoaderArrow.show();
									$pullLoaderSpinner.hide();
									lockScroll = false;
								});
								//lockScroll = false;
							});
						});
						
					} else {
						//alert(3);
						$uiContent.animate({scrollTop: (pullh)}, function(){lockScroll = false});
					}
				}
			}
			//if(!touched) timerCallback();
			timer = window.setTimeout( timerCallback, 150 );
		};
		$uiContent.scroll(scrolled);
		$uiContent[0].addEventListener( 'touchstart', function(e){ touched = true}, false );
		$uiContent[0].addEventListener( 'touchmove', scrolled, false );
		$uiContent[0].addEventListener( 'touchend', function(e){ e.preventDefault(); touched = false; scrolled(); }, false );
		$uiContent.animate({scrollTop: (pullh)}, function(){lockScroll = false});*/
	},
	
	toggleLocation:function(){
		var elements = $('#locationlist').find('.ch-location');
		app.disabledLocations = {};
		elements.each(function(i, el) {
			if(!el.checked)
				app.disabledLocations[$(el).data('id')] = $(el).data('id');
		});
		LocalStore.set('disabledLocations', this.disabledLocations);
		this.filterIndex();
	},
	
	filterIndex: function(w){
		if(!w)
			w = app.filter;
		var lstr = '', lim = '';
		console.log(app.disabledLocations)
		for(var i in app.disabledLocations) {
			lstr += lim + 'li.location-'+i;
			lim = ',';
		}
		//$(lstr, '#thelist').css('display', 'none');
		//$('#thelist > li').not(lstr).css('display', 'block');
		$('#thelist').children('li').css('display', 'none');
		$('#thelist').children('li.show-'+w).not(lstr).css('display', 'block');
		app.filter = w;
		app.setActiveBtn();
	},
	
	setActiveBtn:function(){
		//$('.btn-filter-events.ui-btn-active').removeClass('ui-state-persist');
		$('.btn-filter-events.ui-btn-active').removeClass('ui-btn-active');
		$('#btn-'+app.filter+'-events').addClass('ui-btn-active');
		//$('#btn-'+app.filter+'-events').addClass('ui-state-persist');
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
	
};

function testLive(){
    var event = document.createEvent('HTMLEvents');
    event.initEvent('deviceready', true, true);
    event.eventName = 'deviceready';
    document.dispatchEvent(event);
}