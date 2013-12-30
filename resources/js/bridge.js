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

function likeSong(id, parentEle) {
  var cookie = $.cookie("songs");
  var songs = cookie != null ? JSON.parse(cookie) : Array();
  songs.push(id);
  $.cookie("songs", JSON.stringify(songs), 1);
  request("api/like", "song="+id, function(data){
    console.log("Liking song");
  });
  $(".like-dislike").attr("disabled", "disabled");
}

function dislikeSong(id, parentEle) {
  var cookie = $.cookie("songs");
  var songs = cookie != null ? JSON.parse(cookie) : Array();
  songs.push(id);
  $.cookie("songs", JSON.stringify(songs), 1);
  request("api/dislike", "song="+id, function(data){
    console.log("Disliking song");
  });
  $(".like-dislike").attr("disabled", "disabled");
}

function queueSong(id){
  request("api/queue", "song="+id, function(data){
    console.log(JSON.parse(data))
  });
}

function buildAlbumArt(imgEle, ccEle, data){
  var source = data.song.art;
  if(imgEle.data("src") != source) {
    imgEle.fadeOut("slow", function() {
      $(this).data("src", source).attr("src", source).load(function(){
        $(this).fadeIn();
      });
    });
  }
}

function buildSongInfo(parentEle, data){
  var name = createElement("h2", {"class":"song-title"}, data.song.title);
  var div = createElement("div", {"class":"row"});
  var p = createElement("p", {"class":"col-xs-10"});
  var artist = createElement("span", {"class":"song-artist"}, data.song.artist);
  var br = createElement("br");
  var album = createElement("span", {"class":"song-album"}, data.song.album);
  var likeHolder = createElement("div", {"class":"col-xs-2"});
  var likes = createElement("span", null, Math.abs(data.song.score));
  var space = createText(" ");
  var icon = createElement("span", {"class":"glyphicon glyphicon-thumbs-" + (data.song.score >= 0 ? "up":"down") });
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

function buildSongTime(parentEle, data){
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

function buildUpNext(parentEle, data){
  parentEle.html("");
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

function setButtonSongId(parentEle, data){
  var cookie = $.cookie("songs");
  var songs = cookie != null ? JSON.parse(cookie) : Array();
  if($.inArray(data.song.id, songs) == -1) {
    parentEle.removeAttr("disabled");
    parentEle.data("song-id", data.song.id);
  }
  else {
    parentEle.attr("disabled", "disabled");
    parentEle.data("song-id", 0);
  }
  
}

function buildQueueTable(parentEle, data){
  var table = new Table(["order", "title", "album", "artist", "score"], ["#", "Song", "Album", "Artist", "+1"]);
  parentEle.html("");
  var counter = 1;
  table.addAdvancedColumnProcessor("order", function(data){
    return counter++;
  });
  table.setProperties("table", {"class":"table table-condensed table-striped"});
  var html = table.buildTable(data);
  insertElementAt(html, parentEle[0]);
}

function buildSongTable(parentEle, res){
  var table = new Table(["title", "score", "add"], ["Song", "+1", ""]);
  parentEle.html("");
  table.setProperties("table", {"class":"table table-condensed table-striped"});
  table.addAdvancedColumnProcessor("add", function(data){
    var button = createElement("button", {"class":"btn btn-info btn-sm pull-right"}, "Add To Queue");
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
}

function buildAlbumList(parentEle, data){
  var albumSongs = [];
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
