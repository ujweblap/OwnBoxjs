module.exports = (function(){

    var fs = require('fs'),
        media_folder_usb = "public/uploads/",
        media_folder_local = "public/pendrive/",
        media_depth = new Array(),
        public_dir = __dirname+'/../../usb_emulator/';

    var getExtension = 	function(filename) {
        var i = filename.lastIndexOf('.');
        return (i < 0) ? '' : filename.substr(i+1);
    };

    var fileContentRequest = function(socket, dt){
        console.log('fileContentRequest',dt,public_dir+dt.path);
        if(typeof dt.path != "undefined"){

            fs.readFile('public/'+dt.path, function (err, data) {
                if(err){ console.log("ERROR: readFile('"+media_folder_usb+dt.path); return false; }
                var bufferString = data.toString();
                console.log(bufferString);
                socket.emit('fileContentResponse',bufferString);
            });
        }
    };

    var getFileList = function(data, callback){
        media_depth = data.path.split("/");
        if(data.path == ""){
            media_depth.pop();
        }
        console.log(media_depth);
        var media_folder = media_folder_usb;
        if(data.drive == "USB") {
            media_folder = media_folder_usb;
        } else if (data.drive == "SD") {
            media_folder = media_folder_local;
        }
        console.log("media_folder: "+media_folder+data.path);
        console.log("public:"+public_dir+data.path);
        fs.exists(media_folder+data.path, function(path_exists) {
            if(path_exists){
                fs.readdir(media_folder+data.path, function(err, files) {
                    var files_data = [];
                    for (file in files) {
                        console.log(files[file]);
                        var file_path;
                        var public_file_path;
                        if (media_folder+data.path == media_folder) {
                            file_path = media_folder+data.path+files[file];
                        } else {
                            file_path = media_folder+data.path+"/"+files[file];
                        }
                        console.log("file path:",file_path);
                        var file_data = {
                            "name": files[file],
                            "path": file_path,
                            "public_path": file_path.substr(7),
                            "is_dir": fs.lstatSync(file_path).isDirectory(file_path),
                            "is_file": fs.lstatSync(file_path).isFile(file_path),
                            "ext": getExtension(files[file])
                        };
                        files_data.push(file_data);
                    }
                    var send_data = {
                        "files":files,
                        "files_data": files_data,
                        "depth":media_depth.length,
                        "path": data.path
                    };
                    if(typeof callback === "function"){
                    	callback(send_data);
                    }
                });
            }
        });
    };

    var uploadFile = function(){

    };

    return {
        fileContentRequest: fileContentRequest,
        getExtension: getExtension,
        getFileList: getFileList
    };
}());