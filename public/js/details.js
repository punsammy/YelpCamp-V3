function openWindow(e){
  e.stopPropagation();
  window.open("/campground/<%= campground.id %>/details/<%= campground.detail %>");
}

// var form = document.querySelector('form');
// form.onsubmit = function() {
//   // Populate hidden form on submit
//   var details = document.querySelector('input[name=details]');
//   details.value = JSON.stringify(quill.getContents());
//
//   $.ajax({
//     url: '/details/create/598e10c7ced89b31c205a704',
//     dataType: 'JSON',
//     type: 'POST',
//     data: details.value,
//     success: function(data){
//       console.log(data);
//     },
//     error: function(err) {
//       console.log(err);
//     }
//   });
//
//   return false;
// };
