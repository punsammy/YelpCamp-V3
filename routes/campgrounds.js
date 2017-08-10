var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");

//index route
router.get('/', function(req, res) {
  Campground.find({}, function(err, allCampgrounds){
    if (err) {
      console.log(err);
    } else {
      res.render('campgrounds/index', {campgrounds: allCampgrounds})
    }
  });
});

// create - add new campground to DB
router.post('/', function(req, res) {
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var newCampground = {name: name, image: image, description: desc};
  Campground.create(newCampground, function(err, newlyCreated){
    if (err) {
      console.log(err);
    } else {
      res.redirect('/campgrounds');
    };
  });
});

// new - show form to create new campground
router.get('/new', isLoggedIn, function(req, res) {
  res.render('campgrounds/new');
});

// show page - more info about one campground
router.get('/:id', function(req, res) {
  Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
    if (err) {
      console.log(err);
    } else {
      res.render('campgrounds/show', {campground: foundCampground});
    }
  });
});


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
  console.log("You need to be logged in to gain access");
}


module.exports = router;
