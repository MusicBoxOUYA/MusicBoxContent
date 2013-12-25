function call(){
  request("api/library", "", function(result){
    buildAlbumList($("#album-list"), JSON.parse(result));
  }, function(){
    $("#connection-error-alert").modal({
      keyboard: false,
      backdrop:"static"
    }).modal("show");
  });
}


$( document ).ready(function(){
  call();
  $("#connection-error-alert").on("hidden.bs.modal", function () {
    call();
  })
});
call();

