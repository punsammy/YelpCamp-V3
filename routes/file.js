var Busboy = require('busboy');
var express = require("express");
var router = express.Router();
  router.post('/api/upload', function (req, res, next) {
   // This grabs the additional parameters so in this case passing
   // in "element1" with a value
   var element1 = req.body.element1;
   var busboy = new Busboy({ headers: req.headers });
   // The file upload has completed
   busboy.on('finish', function() {
    console.log('Upload finished');
    // files are stored in req.files
    // req.files.element2:
    // This returns:
    // {
    //    element2: {
    //      data: ...contents of the file...,
    //      name: 'Example.jpg',
    //      encoding: '7bit',
    //      mimetype: 'image/png',
    //      truncated: false,
    //      size: 959480
    //    }
    // }
    // Grabs file object from the request.
    var file = req.files.element2;
    console.log(file);
   });
   req.pipe(busboy);
  });
module.exports = router;
