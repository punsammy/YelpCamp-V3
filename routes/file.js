var AWS = require('aws-sdk');
var Busboy = require('busboy');
var express = require("express");
var Yelpfile = require("../models/file");
var router = express.Router();

router.get('/files', function(req, res){
  Yelpfile.find({}, function(err, files){
    if (err) {
      req.flash("error", "Error: " + err);
    } else {
      res.render("fileupload", {files: files});
    }
  });
});

router.post('/files/upload', function (req, res, next) {
 var busboy = new Busboy({ headers: req.headers });
 busboy.on('finish', function() {
   // store file in req.files
  var file = req.files.testfile;
  // access for aws s3 bucket and user
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
    // save key to mongo database
    Yelpfile.create({name: file.name}, function(err, newFile){
      if (err) {
        req.flash("error", "File not saved to database: " + err);
        res.redirect("back");
      } else {
        req.flash("success", "Successfully uploaded file!");
        res.redirect("back");
      }
    });
  });

 });
 req.pipe(busboy);
});

router.get('/files/download/:name', function (req, res, next) {
  var fileName = req.params.name;
  if (!fileName) {
    req.flash("error", "Error: " + err);
    res.redirect("back");
  } else {
    var options = {
      Bucket: 'yelpcamphark',
      Key: fileName
    };
    // ensures download instead of opening
    res.attachment(fileName);
    var s3bucket = new AWS.S3({
       accessKeyId: process.env.YELPCAMPACCESSKEY,
       secretAccessKey: process.env.YELPCAMPSECRETACCESSKEY,
       Bucket: 'yelpcamphark'
     });
     s3bucket.getObject(options).createReadStream().pipe(res);
  }
});

module.exports = router;
