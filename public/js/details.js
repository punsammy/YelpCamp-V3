function openWindow(campground, detail){
  window.open("/campgrounds/" + campground + "/details/" + detail);
}

function submitEditor(campground) {
  // get contents from quill and call JSON.stringify() on the function
  var details = JSON.stringify(quill.getContents());
  $.post("/campgrounds/" + campground + "/details/new",
  {
    // name the data whatever you want, in this case I named it "bob"
    bob: details,
  }, function(data, status){
    console.log("data: " + details + "status: " + status)
  }
  );
  return false;
};
