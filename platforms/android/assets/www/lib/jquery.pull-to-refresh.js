(function($){
  $.fn.pullToRefresh = function(options) {
	
    var defaults = {
      refresh: function(callback){},
      pull_to_refresh_text: 'Ziehen zum Laden',
      letgo_text: 'Loslassen zum Laden',
      refreshing_text: 'Lade...',
      status_indicator_id: 'pull_to_refresh',
      refresh_class: 'refresh',
      visible_class: 'visible'
    };
    var options = $.extend(defaults, options);

    var content,
        status_indicator,
		indi_content,
        refreshing,
        contentStartY = 0,
        startY = 0,
        track = false,
        refresh = false;
		
	// get the different objects
    content = $(this);
	if(content.attr('hasPullToFresh')) return;
	content.attr('hasPullToFresh', true);
	/*function move_pos(e){
		return contentStartY - (startY - e.changedTouches[0].screenY);
	}*/
	
	status_indicator = $('<div id="' + options.status_indicator_id + '"><div>' + options.pull_to_refresh_text + '</div></div>');
	indi_content = status_indicator.find('div');
	indi_content.css({
		'margin':'0 auto',
		'text-align':'center'
	});
	
	var refreshBarrier = 60;
	//*************iOS*****************Basiert auf Native Scrolling und dass die Kanten Bouncen -> Negatives scrollTop, welches ausgefüllt wird!
	if($.os.ios){ 
		content.before(status_indicator);
		status_indicator.css({
			position: 'absolute',
			overflow:'hidden',
			'text-align':'center',
			color:'#999',
			height:'0px',
			width:'100%',
			top: content.offset().top + 'px'
		});
	  	content.on('scroll', this, function(e){
			var top = content.scrollTop();
			if(top < 0){
				status_indicator.height(-top);
				if(-top <= refreshBarrier){
					indi_content.text(options.pull_to_refresh_text);
				} else {
					indi_content.text(options.letgo_text);
				}
			}
			//$('h1:visible').prepend(content.scrollTop());
		});
		var dur = 300;
		content.on('touchend', this, function(e){
			var top = content.scrollTop();
			if(top < 0 && -top >= refreshBarrier) {
				var fillerHtml = '<div class="pull-filler">'+options.refreshing_text+'</div>';
				var filler = $(fillerHtml);
				filler.css({
					width:'100%',
					'text-align':'center',
					height:status_indicator.height()+'px',
					padding:'0 !important'
				});
				refresh = true;
				window.setTimeout(function(){
					//content[0].innerHTML = '';
					var childs = content.children();
					content.prepend(filler);
					childs.each(function(){
						var self = $(this);
						self.animate({'margin-top':$('body').height()+'px'}, dur, function(){
							self.remove();
						});
					});
					filler = $('.pull-filler');
					status_indicator.height(0);
					options.refresh(function(){
						filler.text('Laden abgeschlossen');
						filler.slideUp(700, function(){
							filler.remove();
						});
					});
				}, 1);
			}
		});
	} else { //Android, etc. Android is broken as it doesn't trigger touchmove oder mousemove without calling e.preventDefault in touchstart. (no native scrolling possible then..)
		return; //Ich will keinem User der Welt so ein Workaround anbieten müssen. Google hat an dieser Stelle sowas von versagt!
		var started = false, ended = true;
		var checkScroll = false;
		var padder = status_indicator;
		var padderHeight = 80;
		var animating = false;
		var disabled = false;
		var scrollTimer, scrollTimer2;
		padder.css({
			'height':padderHeight+'px',
		});
		indi_content.css({
			'margin':'0 auto',
			'padding-top':(padderHeight - 50)+'px',
			'text-align':'center'
		});
		content.prepend(padder);
		
		var scrollToTop = function(silent, pos){
			var top = content.scrollTop();
			var to = pos != undefined ? pos : padderHeight;
			animating = true;
			content.css({'overflow':'hidden'});
			if(silent && silent == 'fast') {
				content.animate({scrollTop:to}, 10, function(){
					animating = false;
					content.css({'overflow':'auto'});
				});
			} else
			if(silent) {
				content.scrollTop(to);
				content.css({'overflow':'auto'});
				animating = false;
			} else
				content.animate({scrollTop:to}, 200, function(){
					animating = false;
					content.css({'overflow':'auto'});
				});
		}
		
		var hidePadder = function(silent){
			disabled = true;
			var top = content.scrollTop();
			scrollToTop(silent, top - padderHeight);
			padder.slideUp(10);
			//scrollToTop(silent, top -  padderHeight);
		}
		
		var showPadder = function(silent){
			disabled = false;
			var top = content.scrollTop();
			scrollToTop(true);
			padder.show();
			scrollToTop(silent);
		}
		
		content.on('touchstart', this, function(e){
			if(!ended) return;
			started = true;
			ended = false;
			var top = content.scrollTop();
			if(!disabled && top > padderHeight) {
				disabled = true;
				hidePadder();
			} else if(disabled && top == 0) {
				disabled = false;
				showPadder();
			}
		});
/*		content.on('touchmove', this, function(e){
			//$('h1:visible').prepend(content.scrollTop());
		});
		content.on('touchcancel', this, function(e){
			//$('h1:visible').prepend(content.scrollTop());
		});*/
		refreshBarrier = 20;
		content.on('touchend', content, function(e){
			var top = content.scrollTop();
			ended = true;
			$('h1:visible').html(disabled);
			//$('h1:visible').prepend(content.scrollTop()+'-');
			if(!disabled && top > padderHeight) {
				hidePadder('fast');
			} else
			if(!disabled && top < padderHeight) {
				//$('h1:visible').html('kleiner');
				if(top < refreshBarrier) { //Refreshen!
					refresh = true;
					indi_content[0].innerHTML = (options.refreshing_text);
					options.refresh(function(){
						hidePadder();
						indi_content[0].innerHTML = ('');
					});
				} else {
					scrollToTop();
				}
				//animating = false;
			}  else if(disabled && top == 0) {
				showPadder();
			}
		});
		content.on('scroll', content, function(e){
			if(!animating) $('h1:visible').prepend(content.scrollTop()+'-');
			var top = content.scrollTop();
			if(!started) {
				if(top < padderHeight) {
					scrollToTop();
				}
			} else if(!disabled && top < padderHeight) {
				if(top < refreshBarrier) { //Refreshen!
					indi_content[0].innerHTML = (options.letgo_text);
				} else {
					indi_content[0].innerHTML = (options.pull_to_refresh_text);
				}
			}
			window.clearTimeout(scrollTimer);
			scrollTimer = window.setTimeout(function(){
				if(animating) return;
				var top = content.scrollTop();
				if(top < padderHeight) {
					content.trigger('touchend');
					window.clearTimeout(scrollTimer2);
				}
			}, 300);
			window.clearTimeout(scrollTimer2);
			scrollTimer2 = window.setTimeout(function(){
				if(animating) return;
				var top = content.scrollTop();
				if(top > padderHeight)
					content.trigger('touchend');
			}, 600);
		});
		$(window).resize(function(e) {
            content.trigger('scroll');
        });
		content.scrollTop(padderHeight);
		//Fix googles Android Error, that touchend isn't triggered neither
	}
  }
})(jQuery);