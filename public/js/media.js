var site = {
	active_menu : "",
	templates: "template/",
	initSite: function(){
		console.log("initSite");
		this.$loading = $("#loading");
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
			$("#content").load(this.templates+menuname+".html",site.changeMenuSelected);
		}
	},
	changeMenuSelected: function() {
		$(".menu_"+site.active_menu).parent().removeClass('active');
		$(".menu_"+site.menuname).parent().addClass('active');
		site.hideLoad();
		site.active_menu = site.menuname;
		//run site action
		//console.log(site.siteActions[site.menuname]);
		site.siteActions[site.menuname].call(site);
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
		
		}
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
		var myCodeMirror = CodeMirror(document.getElementById('videoModalBody'), {
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
				$li.data("ext", data.files_data[elem]["ext"]);
				$li.data("path", data.files_data[elem]["public_path"]);
                $li.append("<a href='"+data.files_data[elem]['public_path']+"'><i ico='pi_math'>P</i></a>");
				switch (data.files_data[elem]["ext"]) {
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
    $upload = $("#uploadForm");
    $upload.on("submit", function(event){
        $(this).ajaxSubmit({

            error: function(xhr) {
                status('Error: ' + xhr.status);
            },

            success: function(response) {
                //TODO: We will fill this in later
                alert("uploaded complete");
            }
        });
        event.preventDefault();
        return false;
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
                $("#videoModalName").html($(this).children(".file_name").html());
                $("#videoModalBody").html("<iframe src='"+file_path+"' width='100%' height='100%'></iframe>");
                $("#videoModal").modal();
                $('#videoModal').on('hidden.bs.modal', function (e) {
                    $("#videoModalBody").html("");
                });
            break;
			case "txt":
			case "js":
			case "htm":
			case "css":
			case "xml":
				fileContentRequest(file_path);
				//getFileContent(file_path);
				$("#videoModalName").html($(this).children(".file_name").html());
				//$("#videoModalBody").html("<iframe width='100%' height='100%' src='"+file_path+"'></iframe>");
				$("#videoModal").modal();
				//var myCodeMirror = CodeMirror.fromTextArea($("#videoModalBody iframe"));
				$('#videoModal').on('hidden.bs.modal', function (e) {
					$("#videoModalBody").html("");
				});
			break;
			case "mp4":
				//alert("mp4");
				$("#videoModalName").html($(this).children(".file_name").html());
				$("#videoModalBody").html("<video width='100%' height='100%' controls><source src='"+file_path+"'></video>");
				$("#videoModal").modal();
				$('#videoModal').on('hidden.bs.modal', function (e) {
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
				$("#videoModalName").html($(this).children(".file_name").html());
				$("#videoModalBody").html("<img src='"+file_path+"' class='img-thumbnail'>");
				$("#videoModal").modal();
				$('#videoModal').on('hidden.bs.modal', function (e) {
					$("#videoModalBody").html("");
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
});