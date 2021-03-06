var callID;
var currentSong;

//called every second to determine 
function call(){
  request("api/nowplaying", "", function(result){
    var data = JSON.parse(result);
    var test = currentSong =! null ? currentSong : data.song.id;
    if(test == data.song.id) { // same song
      onSongRefresh(data);
    }
    else { // new song
      onSongChange(data);
      onSongRefresh(data);
      currentSong = data.song.id;
    }
  }, function(data){
    stopCall();
    $("#connection-error-alert").modal({
      keyboard: false,
      backdrop:"static"
    }).modal("show");
  });
  request("api/queue?limit=3", "", function(result){
    var data = JSON.parse(result);
    onQueueRefresh(data);
  }, function(){
    stopCall();
    $("#connection-error-alert").modal({
      keyboard: false,
      backdrop:"static"
    }).modal("show");
  });
}

function onStart() {
  $("#album-art").removeClass("loading");
}

function onStop() {
  $("#album-art").addClass("loading");
}

function onSongRefresh(data) {
  buildSongTime($(".song-progress"), data);
  buildSongInfo($("#song-info"), data);
}

function onSongChange(data) {
  buildAlbumArt($("#album-art"), $(".color-1"), data);
  setButtonSongId($("#like-button"), data);
  setButtonSongId($("#dislike-button"), data);
}

function onQueueRefresh(data) {
  buildQueueTable($("#queue"),data);
}

function startCall(){
  window.console&&console.log("Starting Call");
  onStart();
  callID = setInterval(call, 1000);
}

function stopCall(){
  window.console&&console.log("Stopping Call");
  onStop();
  clearInterval(callID);
}

$( document ).ready(function(){
  call();
  startCall();
  $("#connection-error-alert").on("hidden.bs.modal", function () {
    startCall();
  })
  $("#like-button").click(function(){
    likeSong($(this).data("song-id"), $(this));
  });
  $("#dislike-button").click(function(){
    dislikeSong($(this).data("song-id"), $(this));
  });
});

