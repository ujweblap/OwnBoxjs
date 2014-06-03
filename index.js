var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	static_dir = __dirname+'/static/',
	public_dir = __dirname+'/public/',
	p_now = require("performance-now"),
    fileBrowser = require('./libs/fileBrowser');

	fileBrowser.readAllFiles('',function(file_list) {
	
	
		//test!
		console.log("-- TEST! --");
		console.log(file_list);
		//process.exit();
	});
	

	server.listen(2013);
	console.log("Server started at:		http://192.168.1.45:2013/");

    app.configure(function(){
        app.use(express.methodOverride());
        app.use(express.multipart());
        app.use(express.json());
        app.use(express.urlencoded());
    });

	app.get('/', function(req,res){
		res.sendfile(static_dir + 'filelist.html');
		console.log("Client connected!");
	});
    app.post('/api/uploadfile', function(req, res) {
        //console.log("uploads",req);
        //console.log("-----!! UPLOAD !! --------");
        //console.log(JSON.stringify(req.files.uploadFile));
        var serverPath = '/uploads/' + req.files.uploadFile.name;

        require('fs').rename(
            req.files.uploadFile.path,
            __dirname + '/public' + serverPath,
            function(error) {
                if(error) {
                    res.send({
                        error: 'Ah crap! Something bad happened at: '+__dirname + '/public' + serverPath,
                        e: error
                    });
                    return;
                }
                //console.log("---!serverPath!---");
				//console.log(serverPath);
                res.send({
                    path: serverPath
                });
            }
        );
    });
    app.post('/',function(req,res){
	   //console.log(req);
	   res.send(req.body); 
    });
    app.post('/api/getFileList', function(req, res){
    	var data = req.body;
	    if(typeof data.path != "undefined"){
		    fileBrowser.getFileList(data, function(send_data){
			    res.send(send_data);
		    });
	    } else {
	    	console.log(req.body);
		    res.send({error:"error_no_path"});
	    }
    });
	
	app.use(express.static(__dirname + '/public'));

	io.sockets.on('connection', function(socket){

		socket.on('fileContentRequest', function(data){
            fileBrowser.fileContentRequest(socket, data);
		});
		
		socket.on('getFileList', function(data) {
			if(typeof data.path != "undefined"){
                fileBrowser.getFileList(data, function(send_data){
	                 socket.emit('dataFileList',send_data, function() {
                        console.log({data:data,send_data:send_data});
                    });
                });
			}
		});
		
		socket.on('uploadStart', function (data) { //data contains the variables that we passed through in the html file
			fileBrowser.uploadFileStart(socket, data);
		});
		
		socket.on('Upload', function (data){
			fileBrowser.uploadData(socket, data);
		});
		
		/* TODO! socket closed / disconnected event handling */
		function log(){
			var array = [">>> Message from server: "];
			for (var i = 0; i < arguments.length; i++) {
				array.push(arguments[i]);
			}
			socket.emit('log', array);
		}
	});

//handle exit
process.stdin.resume();
process.on('SIGINT', function () {
	console.log('Good bye. OwnBoxjs now shutting down...');
    //TODO! close
    closeProcess();
});

var closeProcess = function() {
	console.log(" --- EXIT --- ");
	process.exit();
};