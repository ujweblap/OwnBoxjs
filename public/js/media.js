var site = {
	active_menu : "",
	templates: "template/",
	cache: {},
	initSite: function(){
		console.log("initSite");
		this.$loading = $("#loading");
		this.$fader = $("#fader");
		//this.$fader.on('click',this.closeModal);
		$("header").load(this.templates+"media_menu.html",this.initMenu);
		this.changeMenu("media");
	},
	initMenu: function(){
		$(".menu").click(site.clickMenu);
		$("footer").load(site.templates+"footer.html",site.hideLoad);
	},
	clickMenu: function() {
		site.changeMenu($(this).attr('rel'));
	},
	changeMenu: function(menuname) {
		if (this.active_menu != menuname) {
			this.menuname = menuname;
			this.showLoad();
			if(this.active_menu == "upload"){
				site.closeModal();
			}
			if(menuname == "upload"){
				if(this.active_menu != ""){
					site.cache[this.active_menu] = $("#content").find('.content_'+this.active_menu).detach();
				}
				site.changeMenuSelected();
			} else {
				if(typeof site.cache[menuname] != "undefined"){
					site.cache[this.active_menu] = $("#content").find('.content_'+this.active_menu).detach();
					$("#content").append(site.cache[menuname]);
					site.changeMenuSelected();
				} else {
					if(this.active_menu != ""){
						site.cache[this.active_menu] = $("#content").find('.content_'+this.active_menu).detach();
					}
					var $loaded_content = $("<div />");
					$loaded_content.addClass('content_'+menuname);
					site.cache[menuname] = $loaded_content;
					$loaded_content.load(this.templates+menuname+".html",function() {
						site.cache[menuname] = $loaded_content;
						site.changeMenuSelected();
						$("#content").append($loaded_content);
					});
					//$("#content").load(this.templates+menuname+".html",site.changeMenuSelected);
				}
			}
		}
	},
	changeMenuSelected: function() {
		$(".menu_"+site.active_menu).parent().removeClass('active');
		$(".menu_"+site.menuname).parent().addClass('active');
		site.hideLoad();
		site.active_menu = site.menuname;
		//run site action
		//console.log(site.siteActions[site.menuname]);
		if(typeof site.siteActions[site.menuname] === "function"){
			site.siteActions[site.menuname].call(site);
		} else {
			console.log("not implemented menuAction: "+site.menuname);
		}
	},
	showLoad: function(){
		site.$loading.show();
	},
	hideLoad: function(){
		site.$loading.fadeOut(100);
	},
	siteActions: {
		dashboardmedia: function() {
			
		},
		video1: function() {
		
		},
		media: function(){
			$("#fl_container").trigger('siteChange', ["media"]);
		},
		music: function() {
			
		},
		upload: function(){
			site.showUploadModal();
		}
	},
	showUploadModal: function() {
		this.$fader.fadeIn(200);
		$("#uploadMenu").css("top", "-100%").show().animate({top:"50px"});
		/*
		$('#modal').on('hidden.bs.modal', function (e) {
			$("#modalBody").html("");
		});*/
	},
	closeModal: function() {
		site.$fader.fadeOut(200);
		$("#uploadMenu").animate({top:"-100%"});
	}
};

$(function() {
	var socket = io.connect();
	var current_path = "";
	var $body = $("body");
	var $fl_container = $("#fl_container");
	var $file_list = $("#file_list");
	var $path = $("#path");
	function fileContentRequest(path){
		console.log("fileContentRequest",path);
		socket.emit("fileContentRequest",{"path":""+path});
	}
	function getFileContent(path){
		console.log("getFileContent",path);
		socket.emit("getFileContent",{"path":path,"drive":drive_name});
	}
	function getFileList(path) {
		current_path = path;
		var drive_name = $("#drive_name").value;
		socket.emit("getFileList",{"path":current_path,"drive":drive_name});
	}
	function addPath(dt,act_path) {
		console.log("addPath. dt: ",dt);
		$path = $("#path");
		var $path_elem = $("<label />");
		$path_elem.addClass("btn btn-primary");
		$path_elem.data("depth", dt.depth);
		$path_elem.data("path",dt.path);
		$path_elem.append("<span class='glyphicon glyphicon-folder-open'></span> "+dt.name);
		$path_elem.click(function() {
			$(this).nextAll("label").remove();
			$("#path_"+(parseInt(dt.depth)+1)).show();
			$("#path_"+(parseInt(dt.depth)+1)).nextAll(".file_list").hide().remove();
			console.log("depth: ",dt.depth);
			//.animate({"width":"98%"},2000);
			getFileList(act_path);
		});
		$path.append($path_elem);
	}
	socket.on("fileContentResponse", function(data){
		//$("#videoModalBody").html("<textarea id='file_content_original' class='code_mirror file_content'>"+data+"</textarea>");
		var myCodeMirror = CodeMirror(document.getElementById('modalBody'), {
		  value: data,
		  mode:  "javascript"
		});
	});
	socket.on("dataFileList", function(data) {
		//console.log(data);
		//$file_list = $("#file_list");
		var $directory_list = $();
		var $files_list = $();
		if($("#path_"+data.depth).length == 0) {
			$file_list = $("<ul />").addClass("file_list item").attr("id", "path_"+data.depth);
			$("#fl_container .slide_inner").append($file_list);
		} else {
			$file_list = $("#path_"+data.depth);			
		}
		$file_list.prevAll(".file_list").hide();
		$file_list.html("");
		if(current_path != ""){
			$file_list.append("<li class='dotdot btn btn-default btn-block'><span class='glyphicon glyphicon-folder-close'></span> ..</li>");
		}
		$.each(data.files_data,function(elem) {
			var $li = $("<li />");
			$li.addClass('col-xs-12');
			var $elem_icon = $("<span />");
				$elem_icon.addClass("glyphicon");
			var act_path = current_path;
			if(current_path != "") {
				act_path = current_path+"/"+data.files_data[elem]["name"];
			} else {
				act_path = data.files_data[elem]["name"];
			}
			$li.on("click",function() {
				console.log(data.files_data[elem]["is_file"]);
				console.log("act_path: ",act_path,data.files_data[elem]);
				if(data.files_data[elem]["is_dir"]){
					data.files_data[elem]["depth"] = data.depth;
					addPath(data.files_data[elem],act_path);
					getFileList(act_path);
				}
			});
			if(data.files_data[elem]["is_dir"]){
				$li.addClass("is_dir btn btn-primary btn-block");
				$elem_icon.addClass("glyphicon-folder-open");
				$directory_list.push($li.get(0));
			}
			if(!data.files_data[elem]["is_dir"] && !data.files_data[elem]["is_file"]){
				$li.addClass("is_nofiledir btn btn-danger btn-block");
				$li.click(function() {
					alert("wrong file format");
				});
			}
			if (data.files_data[elem]["is_file"]) {
				$li.addClass("is_file btn btn-info btn-block");
				$li.addClass("file_ext_"+data.files_data[elem]["ext"]);
				$li.data("ext", data.files_data[elem]["ext"].toLowerCase());
				$li.data("path", data.files_data[elem]["public_path"]);
                $li.append("<a href='"+data.files_data[elem]['public_path']+"' title='Download' class='download-file' download><i class='glyphicon glyphicon-cloud-download'></i> </a>");
				switch (data.files_data[elem]["ext"].toLowerCase()) {
					case "mov":
					case "mp4":
						$elem_icon.addClass("glyphicon-film");
					break;
					case "mp3":
						$elem_icon.addClass("glyphicon-music");
					break;
					case "html":
					case "txt":
					case "js":
					case "htm":
					case "css":
					case "xml":
						$elem_icon.addClass("glyphicon-file");
					break;
					case "jpg":
					case "jpeg":
					case "png":
					case "gif":
					case "bmp":
					case "ico":
						$elem_icon.addClass("glyphicon-picture");
					break;
				}
				$files_list.push($li.get(0));
			}
			$li.append($elem_icon);
			$li.append(" <span class='file_name'>"+data.files_data[elem]["name"]+"</span>");
			//$file_list.append($li);
		});
		console.log($directory_list);
		//$directory_list.children("li").unwrap();
		//$files_list.children("li").unwrap();
		$file_list.append($directory_list);
		$file_list.append($files_list);
	});
	$refresh = $("#refresh");
	$(document).on("click","#refresh",function() {
		getFileList(current_path);
	});
	$home_tr = $("#home_tree");
	$(document).on("click","#home_tree",function() {
		$(this).nextAll("label").remove();
		current_path = "";
		$("#path_0").nextAll(".file_list").remove();
		$("#path_0").show();
		getFileList(current_path);
	});
	$dotdot = $(".dotdot");
	$(document).on("click",".dotdot",function() {
		var path_pieces = current_path.split("/");
		path_pieces.pop();
		var dot_path = path_pieces.join("/");
		$("#path label").last().remove();
		$("#path_"+(path_pieces.length)).show().next(".file_list").remove();
		getFileList(dot_path);
	});
	$(document).on("click",".is_file",function() {
		var file_path = $(this).data("path");
		switch ($(this).data("ext")) {
			case "html":
                $("#modalName").html($(this).children(".file_name").html());
                $("#modalBody").html("<iframe src='"+file_path+"' width='100%' height='100%'></iframe>");
                $("#modal").modal();
                $('#modal').on('hidden.bs.modal', function (e) {
                    $("#modalBody").html("");
                });
            break;
			case "txt":
			case "js":
			case "htm":
			case "css":
			case "xml":
				fileContentRequest(file_path);
				//getFileContent(file_path);
				$("#modalName").html($(this).children(".file_name").html());
				//$("#videoModalBody").html("<iframe width='100%' height='100%' src='"+file_path+"'></iframe>");
				$("#modal").modal();
				//var myCodeMirror = CodeMirror.fromTextArea($("#videoModalBody iframe"));
				$('#modal').on('hidden.bs.modal', function (e) {
					$("#modalBody").html("");
				});
			break;
			case "mov":
			case "mp4":
				//alert("mp4");
				$("#modalName").html($(this).children(".file_name").html());
				$("#modalBody").html("<video width='100%' height='100%' controls><source src='"+file_path+"'></video>");
				$("#modal").modal();
				$('#modal').on('hidden.bs.modal', function (e) {
					$("#videoModalBody").html("");
				});
				//video popup
			break;
			case "mp3":
				$(".musicName").html($(this).children(".file_name").html());
				$(".musicTag").html("<audio id='audioPlayer' controls><source src='/"+file_path+"'></audio>")
				$("#musicPlayer").fadeIn(600);
				document.getElementById("audioPlayer").play();
			break;
			case "jpg":
			case "jpeg":
			case "png":
			case "gif":
			case "bmp":
			case "ico":
				$("#modalName").html($(this).children(".file_name").html());
				$("#modalBody").html("<img src='"+file_path+"' class='img-thumbnail'>");
				$("#modal").modal();
				$('#modal').on('hidden.bs.modal', function (e) {
					$("#modalBody").html("");
				});
			break;
		}
	});
	$(document).on("click","#musicPlay",function() {
		document.getElementById("audioPlayer").play();
	});
	$(document).on("click","#musicStop",function() {
		document.getElementById("audioPlayer").pause();
	});
	function drawTree() {};
	site.initSite();
	$(document).on('siteChange','#fl_container',function(event, siteName){
		console.log("siteChange event",siteName);
		socket.emit('init gpio', true);
		if(siteName == "media") {
			console.log("media menu");
			getFileList("");
		}
	});
	
	/* uploader */

    $upload = $("#uploadForm");
    $(document).on("submit","#uploadForm", function(event){
        $(this).ajaxSubmit({

            error: function(xhr) {
                status('Error: ' + xhr.status);
            },

            success: function(response) {
                //TODO: We will fill this in later
                console.log(response);
                alert("uploaded complete");
            }
        });
        event.preventDefault();
        return false;
    });

	
	var SelectedFile;
	function FileChosen(evnt) {
	    SelectedFile = evnt.target.files[0];
	    document.getElementById('NameBox').value = SelectedFile.name;
	}
	
	var FReader;
	var Name;
	function StartUpload(){
	    if(document.getElementById('FileBox').value != "")
	    {
	        FReader = new FileReader();
	        Name = document.getElementById('NameBox').value;
	        var Content = "<span id='NameArea'>Uploading " + SelectedFile.name + " as " + Name + "</span>";
	        Content += '<div id="ProgressContainer" class="alert alert-info"><i class="glyphicon glyphicon-arrow-up"></i> <span id="percent">0%</span> <div id="ProgressBar">';
	        Content += '<div class="progress progress-striped active"><div class="progress-bar"  role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span class="sr-only">0%</span></div></div>';
	        Content +='</div></div>';
	        Content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(SelectedFile.size / 1048576) + "MB</span>";
	        document.getElementById('UploadArea').innerHTML = Content;
	        FReader.onload = function(evnt){
	            socket.emit('Upload', { 'Name' : Name, Data : evnt.target.result });
	        }
	        socket.emit('uploadStart', { 'Name' : Name, 'Size' : SelectedFile.size });
	    }
	    else
	    {
	        alert("Please Select A File");
	    }
	}
	
	socket.on('MoreData', function (data){
	    UpdateBar(data['Percent']);
	    var Place = data['Place'] * 524288; //The Next Blocks Starting Position
	    var NewFile; //The Variable that will hold the new Block of Data
	    console.log("--SELECTED FILE--");
	    console.log(SelectedFile);
	    if(SelectedFile.webkitSlice) 
	        NewFile = SelectedFile.webkitSlice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
	    else if(SelectedFile.mozSlice)
	        NewFile = SelectedFile.mozSlice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
	    else
	    	NewFile = SelectedFile.slice(Place, Place+Math.min(524288, (SelectedFile.size-Place)));
	    FReader.readAsBinaryString(NewFile);
	});
	 
	function UpdateBar(percent){
	    //$('#ProgressBar').css('width',percent + '%');
	    $('#ProgressBar .progress-bar').attr('aria-valuenow', parseInt(percent,10)).css('width', percent+'%');
	    document.getElementById('percent').innerHTML = (Math.round(percent*100)/100) + '%';
	    var MBDone = Math.round(((percent/100.0) * SelectedFile.size) / 1048576);
	    document.getElementById('MB').innerHTML = MBDone;
	}
	var Path = "http://localhost:2013/";
	 
	socket.on('Done', function (data){
		$("#uploadModal .alert").show();
	    var Content = "File Successfully Uploaded !!"
	    //Content += "<img id='Thumb' src='" + Path + data['path'] + "' alt='" + Name + "'><br>";
	    Content += "<button  type='button' name='Upload' value='' id='Restart' class='Button'>Upload Another</button>";
	    document.getElementById('UploadArea').innerHTML = Content;
	    document.getElementById('Restart').addEventListener('click', Refresh);
	});
	function Refresh(){
	    location.reload(true);
	}
	
	if(window.File && window.FileReader){ //These are the relevant HTML5 objects that we are going to use 
		$(document).on('click','#UploadButton', StartUpload);  
		$(document).on('change','#FileBox', FileChosen);
	} else {
		$('#UploadArea').html("Your Browser Doesn't Support The File API Please Update Your Browser<br>Try simple upload:<br>");
		$upload.show();
	}
});