var AWS = require('aws-sdk');
var Busboy = require('busboy');
var express = require("express");
var Yelpfile = require("../models/file");
var Campground = require("../models/campground");
var Detail = require("../models/detail");
var router = express.Router();

//ADDING ATTACHMENTS
// INDEX
router.get('/files', function(req, res){
  Yelpfile.find({}, function(err, files){
    if (err) {
      req.flash("error", "Error: " + err);
    } else {
      res.render("fileupload", {files: files});
    }
  });
});

// UPLOAD FILES
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

// DOWNLOAD FILES
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

// POST DETAILS ROUTE
router.post("/campgrounds/:id/details/new", function(req, res){
  Campground.findById(req.params.id, function(err, campground){
    // create new Detail with text as the data (bob) sent from quill js ajax request
    Detail.create({text: req.body.bob}, function(err, newDetail){
      if (err) {
        console.log(err);
        res.redirect("back");
      } else {
        campground.detail = newDetail;
        campground.save();
        res.redirect("back");
      }
    });
  });
});

// Get details route
router.get("/campgrounds/:id/details/:detail_id", function(req, res){
  Campground.findById(req.params.id, function(err, campground){
    if (err) {
      res.redirect("/");
      console.log(err);
    } else {
      Detail.findById(req.params.detail_id, function(err, detail){
        res.render("details/show", {campground: campground, detail: detail})
      });
    }
  });
});

module.exports = router;
