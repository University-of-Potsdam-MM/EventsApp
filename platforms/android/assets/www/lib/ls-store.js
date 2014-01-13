var LocalStore = {

	get : function(key, empty){
		var it = localStorage.getItem(key);
		try {
			it = JSON.parse(it);
		} catch (e) {}
		if(it == undefined)
			it = empty;
		return it;
	},
	
	set : function(key, value, itemValue){
		if(itemValue) {
			var k = value;
			value = this.get(key);
			if(!value)
				value = {};
			value[k] = itemValue;
		}
		localStorage.setItem(key, JSON.stringify(value));
	},
	
	val : function(key, value) {
		if(value)
			localStorage.setItem(key, value);
		else
			localStorage.getItem(key);
	},

}