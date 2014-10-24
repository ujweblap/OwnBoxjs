module.exports = (function(){

	var mongoose = require('mongoose');

    mongoose.connect('mongodb://Bences-MacBook.local/crud_db');
    //mongoose.connect('mongodb://192.168.1.161:27017/crud_db');

    var User = mongoose.model('users', { name: String , lang: Array});
    var schemaDir  = mongoose.model('fl_dir', {path: String, depth: Number});
    var schemaFile = mongoose.model('fl_file', {name: String, ext: String, path: String, type: String, depth: Number});
    var schemaImage = mongoose.model('fl_image', {name: String, _file: { type: 'ObjectId', ref: 'fl_file' }});
    var schemaVideo = mongoose.model('fl_video', {name: String, _file: { type: 'ObjectId', ref: 'fl_file' }});
    var schemaMusic = mongoose.model('fl_music', {name: String, _file: { type: 'ObjectId', ref: 'fl_file' }});
    var schemaWebapp = mongoose.model('fl_webapp', {name: String, _file: { type: 'ObjectId', ref: 'fl_file' }});
    var schemaFavs = mongoose.model('favs', {name: String, title: String, url: String});
    var collections = {
      users: User,
      dirs: schemaDir,
      files: schemaFile,
      image: schemaImage,
      video: schemaVideo,
      music: schemaMusic,
      webapp: schemaWebapp,
      fav: schemaFavs
    };

	var load = function(coll, find_dt, cb) {
		//var find_dt = {};
		//find_dt[field] = value;

		//var find_dt = query;
		if(collections.hasOwnProperty(coll)){
		    collections[coll].find(find_dt, function(err, dt){
		    	if(err){
		    		cb({error:true,msg:err,search:find_dt});
		    	}
		        if(dt.length===0){
		            cb({error:true,msg:"No result",search:find_dt});
		        } else {
		            cb({coll:coll,search:find_dt,data:dt,error:false});
		        }
		    });
		} else {
		    cb({error:true,msg:"Not Found",search:find_dt});
		}
	};

	var loadId = function(coll, id, cb) {
		collections[coll].findById(id, function(err, dt) {
			cb(err, dt);
		});
	}

	var del = function() {
	
	};
	
	var save = function(coll, id, data, cb) {
		loadId(coll,id, function(err, dt) {
			for(prop in data){
				dt[prop] = data[prop];
			}
			dt.save(function(err) {
				if(typeof cb === "function"){
					cb();
				}
			});
		});
	};

	var insert = function(coll, data, cb) {
		var save_dt = new collections[coll](data);
		save_dt.save(function(err){
			if (typeof cb === "function") {
				cb(save_dt._id);
			}
		});
	};

	return {
		load: load,
		del: del,
		save: save,
		insert: insert
	};

}());