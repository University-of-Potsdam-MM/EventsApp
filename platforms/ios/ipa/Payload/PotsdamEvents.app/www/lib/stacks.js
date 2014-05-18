/**
 * Create iOS style stackable list/content headers
 * Made by Martin Kapp @mantir based on work by Mike Smedley @pxlcrft
 *
 * Arguments:
 * @body: The selector for the scrollable parent container holding your sticky elements. Only one container at a time.
 * @title: The selector for the sticky elements
 * @margin: Because the title gets absolutely positioned when it hits the bottom, you might need to supply a negative margin to counter any padding/margin on your parent element
 * @offset: If you have other fixed elements above, you can specify the offset here
 */

(function( $ ) {
  $.fn.stacks = function(options) {

  	var settings = $.extend( {
		body   : '#stickyparent',
		title  : '.stickyheader',
		margin : 0,
		offset : 0,
		fixAndroid: false,
		fixiOS: false,
		touch: false
    }, options);
	var container = $(settings.body);
	//settings.offset += container.offset().top;
	var ar = {}, current = -1, coffset = 0, refresh = false, $title = false;
	var elements = this.find(settings.body+' '+settings.title);
	function initArray(){
		ar = {};
		var lastOffset = -1;
		elements.removeClass('fixed').removeClass('absolute').removeAttr('style');
		$('.filler', container).remove();
		coffset = container.offset().top;
		if(!$title) {
			$title = $('<div style="position:fixed !important" class="">ddd</div>');
			container.parents(':first').prepend($title);
			$title.attr('class', container.attr('class'));
		}
		$title.css({
			'position':'fixed !important',
			'top':coffset+'px !important',
			'width':container.width()+'px !important',
			'z-index':1000
		});
		$.each(elements, function(k,v){
			var $v = $(v), a = {};
			var scrollTop = container.scrollTop();
			//console.log(scrollTop); 
			//console.log($v.position().top);
			//console.log($v.outerHeight());
			var offset = $v.position().top + scrollTop;
			var bdr = 0;
			var bordertopheight = $v.css('border-top-width').substring(0,$v.css('border-top-width').indexOf('p'));
			var borderbtmheight = $v.css('border-bottom-width').substring(0,$v.css('border-bottom-width').indexOf('p'));
			bdr = (parseInt(bordertopheight) + parseInt(borderbtmheight));
			a = {height:$v.outerHeight(true) + bdr, last:lastOffset, $:$v, absolute:false, fixed:false, id:k, $filler:false, parent:$v.parents(':first')};
			if(lastOffset > -1)
				ar[lastOffset].next = offset;
			ar[offset] = a;
			lastOffset = offset
		});
		//console.log(ar);
		var eventName = settings.touch ? 'touchmove' : 'scroll';
		container.off(eventName+'.stacks');
		container.on(eventName+'.stacks', this, function(){
			var scrollTop = container.scrollTop();
			//console.log(scrollTop);
			for(var i in ar){
				var a = ar[i];
				var $v = a.$;
				var next = ar[a.next];
				var makeAbsolute = false, makeFixed = false, makeUnfix = false, checkFiller = false;
				if(scrollTop >= i) {
					if(scrollTop <= a.next) {
						if(scrollTop >= a.next - next.height) {
							if(!a.absolute || refresh) {
								//absolute
								makeAbsolute = a.next - next.height;
							}
						} else {
							if(!a.fixed || refresh) {
								//fixed
								makeFixed = true;
							}
						}
					}
				} else if(a.fixed || a.absolute || refresh) {
					makeUnfix = true;
				}
				if(makeAbsolute) {
					var vheight = $v.outerHeight(true);
					$v.removeClass('fixed').addClass('absolute').css({'top':makeAbsolute+'px', 'height':vheight+'px'});
					a.absolute = true;
					a.fixed = false;
					checkFiller = true;
				} else if(makeFixed){
					var awidth = $v.width();
					$title.html($v);
					$title.css('top', (coffset - $v.css('margin-top').replace(/px/,''))+'px'), 
					//$v.removeClass('absolute').addClass('fixed').css({'width':awidth});
					a.absolute = false;
					a.fixed = true;
					checkFiller = true;
				} else if(makeUnfix){
					$v.removeClass('fixed').removeClass('absolute').removeAttr('style');
					a.$filler.remove();
					a.$filler = false;
					a.absolute = false;
					a.fixed = false;
				}
				if(checkFiller){
					if(!a.$filler) {
						a.$filler = $('<div class="filler"></div>');
						a.$filler.css('height',a.height+'px').insertAfter(a.$);
					}
				}
				if(a.fixed){
					if(settings.fixAndroid) {
						a.$.css('top', coffset+'px');
					} else {
						//a.$.css('top', scrollTop);
					}
				}
			}
		});
		container.trigger('scroll');
	}

	$(window).resize(function(){
		initArray();
	});
	initArray();
  };
})( jQuery );
