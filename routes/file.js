var AWS = require('aws-sdk');
var Busboy = require('busboy');
var express = require("express");
var router = express.Router();
  router.get('/upload', function(req, res){
    res.render("fileupload");
  });
  router.post('/upload', function (req, res, next) {
   var busboy = new Busboy({ headers: req.headers });
   // The file upload has completed
   busboy.on('finish', function() {
    var file = req.files.testfile;
    console.log(file);

    var s3bucket = new AWS.S3({
      accessKeyId: process.env.YELPCAMPACCESSKEY,
      secretAccessKey: process.env.YELPCAMPSECRETACCESSKEY,
      Bucket: 'yelpcamphark'
    });
    s3bucket.upload({
      Bucket: 'yelpcamphark',
      Key: file.name,
      Body: file.data
    }, function (err, data) {
      if (err) {
        req.flash("error", "Error: " + err);
        res.redirect("back");
      }
      req.flash("success", "Successfully uploaded file!");
      res.render("landing");
    });

   });
   req.pipe(busboy);
  });
module.exports = router;
