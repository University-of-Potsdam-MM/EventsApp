/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
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
		var match = url.match(app.detailsURL);
		if (match) {
			$.mobile.changePage("view.html",{allowSamePageTransition:true,reloadPage:false,changeHash:changeHash,transition:"slide"});
            app.afterLoad = function(){
                alert(match[1]);
                app.loadEvent(match[1]);
            }
		}
        return false;
	},
    // Update DOM on a Received Event
    loadList: function() {
        //alert(this.jsonUrl);
		$.getJSON(this.jsonUrl + 'events', this.renderIndex);
    },
                               
    loadEvent: function(id){
        $.getJSON(this.jsonUrl + 'events/view/' + id, this.renderView);
    },
    
    tapped : function(){
        var url = $(this).data('href');
        //alert(url);
        app.route(url, true);
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