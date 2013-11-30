function request(url, sendData, callBack, errorCallBack){
  errorCallBack = typeof errorCallBack === "function" ? errorCallBack : function(){};
  $.ajax({
    url:url,
    type:"GET",
    data:sendData,
    success:function(result){
      callBack(result)
    },
    error:function(result){
      errorCallBack(result);
    }
  })
}

function likeSong(id){
  request("api/like", "song="+id, function(data){
    console.log("Liking song");
  });
}

function dislikeSong(id){
  request("api/dislike", "song="+id, function(data){
    console.log("Disliking song");
  });
}

function queueSong(id){
  request("api/queue", "song="+id, function(data){
    console.log(JSON.parse(data))
  });
}

function buildAlbumArt(imgEle, ccEle, res){
  var data = JSON.parse(res);
  var source = data.song.art;
  imgEle.fadeOut("slow", function() {
    $(this).data("src", source).attr("src", source).load(function(){
      setColor(this, ccEle);
      $(this).fadeIn();
    });
  });
}

function buildSongInfo(parentEle, res){
  var data = JSON.parse(res);
  var name = createElement("h2", {"class":"song-title"}, data.song.title);
  var div = createElement("div", {"class":"row"});
  var p = createElement("p", {"class":"col-xs-10"});
  var artist = createElement("span", {"class":"song-artist"}, data.song.artist);
  var br = createElement("br");
  var album = createElement("span", {"class":"song-album"}, data.song.album);
  var likeHolder = createElement("div", {"class":"col-xs-2"});
  var likes = createElement("span", null, Math.abs(data.song.score));
  var space = createText(" ");
  var icon = createElement("span", {"class":"glyphicon glyphicon-thumbs-" + data.song.score >= 0 ? "up":"down" });
  parentEle.html("");
  insertElementAt(name, parentEle[0]);
  insertElementAt(p, div);
  insertElementAt(likeHolder, div);
  insertElementAt(likes, likeHolder);
  insertElementAt(space, likeHolder);
  insertElementAt(icon, likeHolder);
  insertElementAt(div, parentEle[0]);
  insertElementAt(album, p);
  insertElementAt(br, p);
  insertElementAt(artist, p);
}

function buildSongTime(parentEle, res){
    var data = JSON.parse(res);
    var currentMinutes = Math.floor((data.position/1000)/60);
    var currentSeconds = Math.floor((data.position/1000)%60);
    if(currentSeconds < 10){
      currentSeconds = "0" + currentSeconds;
    }
    var durationMinutes = Math.floor((data.duration/1000)/60);
    var durationSeconds = Math.floor((data.duration/1000)%60);
    if(durationSeconds < 10){
      durationSeconds = "0" + durationSeconds;
    }
    var currentTimeParent = createElement("div", {"class":"small-1 columns"});
  var currentTime = createElement("span", {"class":""}, currentMinutes + ":" + currentSeconds);
  var durationTime = createElement("span", {"class":""}, durationMinutes + ":" + durationSeconds);
  var percent = ((data.position/data.duration)*100);
  var progressPercent = createElement("div", {"class":"progress-bar progress-bar-info", "role":"progressbar","style":"width: " + percent + "%"});
  parentEle.html("");
  insertElementAt(currentTime,parentEle[0]);
  insertElementAt(progressPercent,parentEle[1]);
  insertElementAt(durationTime,parentEle[2]);
}

function setColor(image, elements) {
  var thief = new ColorThief();
  var colors = thief.getPalette(image[0], 2);
  $("body").css("background-color", "rgb(" + colors[0][0] + "," + colors[0][1] + "," + colors[0][2] + ")");
  elements.css("color", "rgb(" + colors[1][0] + "," + colors[1][1] + "," + colors[1][2] + ")");
}

function buildUpNext(parentEle, res){
  parentEle.html("");
  var data = JSON.parse(res);
  if ( data.length == 0 )
	return;
  var p = createElement("p");
  var title = createElement("b", null, "Up Next: ");
  var artist = createElement("span", null, data[0].title);
  var album = createElement("span", null, data[0].artist); 
  var dash = createText(" - ");
  
  insertElementAt(title, p);
  insertElementAt(artist, p);
  insertElementAt(dash, p);
  insertElementAt(album, p);
  if(data.length != 0)
    insertElementAt(p, parentEle[0]);
}

function setButtonSongId(parentEle, res){
  var data = JSON.parse(res);
  parentEle.data("song-id", data.song.id);
}

function buildQueueTable(parentEle, res){
  var table = new Table(["order", "title", "album", "artist", "score"], ["#", "Song", "Album", "Artist", "+1"]);
  parentEle.html("");
  var counter = 1;
  table.addAdvancedColumnProcessor("order", function(data){
    return counter++;
  });
  table.setProperties("table", {"class":"table table-condensed table-striped"});
  var html = table.buildTable(res);
  insertElementAt(html, parentEle[0]);
}

function buildSongTable(parentEle, res){
  var table = new Table(["title", "album", "artist", "score", "add"], ["Song", "Album", "Artist", "+1", ""]);
  parentEle.html("");
  table.setProperties("table", {"class":"table table-condensed table-striped"});
  table.addAdvancedColumnProcessor("add", function(data){
    button = createElement("button", {"class":"btn btn-info btn-sm"}, "Add To Queue");
    $(button).click(function(){
      $(this).attr("disabled", "disabled").delay(10000).queue(function(next){
        $(this).removeAttr("disabled");
        next();
      });
      console.log("queuing song " + data["id"]);
      queueSong(data["id"]);
    });
    return button;
  });
  var html = table.buildTable(res);
  insertElementAt(html, parentEle[0]);
  parentEle.load(function(){
    alert("loaded");
  })
}

function buildAlbumList(parentEle, res){
  var albumSongs = [];
  var data = JSON.parse(res);
  parentEle.html("");
  for(album in data){
    var div = createElement("div", {"class":"col-sm-3"});
    var holder = createElement("div", {"class":"album-holder"});
    var holderInner = createElement("div", {"class":"place-holder album-holder-inner"})
    var a = createElement("a", {"href":"#", "data-toggle":"modal", "data-target":"#album-song-list", "data-album-id":album})
    var img = createElement("img", {"src":"http://placehold.it/250x250", "class":"img-responsive album-art loading"});
    var info = createElement("div", {"class":"text-center"});
    var title = createElement("p", {"class":"album-artist"}, data[album].title);
    var artist = createElement("p", {"class":"album-artist lead small"}, data[album].artist);
    
    var source = data[album].songs[0].art;
    $(img).attr("src", source).load(function(){
      $(this).hide().removeClass("loading").fadeIn();
    });
    
    insertElementAt(img, holderInner);
    insertElementAt(holderInner, a);
    insertElementAt(a, holder);
    insertElementAt(title, info);
    insertElementAt(artist, info);
    insertElementAt(holder, div);
    insertElementAt(info, div);
    insertElementAt(div, parentEle[0]);
    albumSongs.push(data[album].songs);
    $(a).data("songs", data[album].songs);
    $(a).data("title", data[album].title);
    $(a).click(function(){
      $this = $(this);
      $("#album-list-title").html($this.data("title"));
      buildSongTable($("#album-song-table"), $(this).data("songs"));
    });
  }
  return albumSongs;
}
