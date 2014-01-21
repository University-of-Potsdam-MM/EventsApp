$.mvc.controller.create("main", {
    name: 'main',
	views:["views/main.menu.html"], //These are the views we will use with the controller

    init:function(){
		
    },
	
    menu:function(){
		var self = this;
		app.loadPage(this.name, 'menu', null, '-slide');
    }
	
});