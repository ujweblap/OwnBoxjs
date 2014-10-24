module.exports = (function(){
	var crud = require('./crudMongo');
	function LinkModel(){
		
	}
	
	var getLinks = function(cb) {
		crud.load('fav',{},cb);
	};
	
	var linkByUrl = function() {};
	var saveUrl = function() {};
	
	return {
		links: getLinks,
		linkByUrl: linkByUrl,
		saveUrl: saveUrl
	} 
})();