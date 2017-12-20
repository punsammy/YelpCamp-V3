var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//index route
router.get('/', function(req, res) {
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    Campground.find({name: regex}, function(err, allCampgrounds){
      if (err) {
        console.log(err);
      } else {
        res.render('campgrounds/index', {campgrounds: allCampgrounds})
      }
    });
  } else {
    Campground.find({}, function(err, allCampgrounds){
      if (err) {
        console.log(err);
      } else {
        res.render('campgrounds/index', {campgrounds: allCampgrounds})
      }
    });
  }
});

// create - add new campground to DB
router.post('/', middleware.isLoggedIn, function(req, res) {
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var price = req.body.price;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var newCampground = {name: name, image: image, description: desc, author: author, price: price};
  Campground.create(newCampground, function(err, newlyCreated){
    if (err) {
      console.log(err);
    } else {
      res.redirect('/campgrounds');
    };
  });
});

// new - show form to create new campground
router.get('/new', middleware.isLoggedIn, function(req, res) {
  res.render('campgrounds/new');
});

// show page - more info about one campground
router.get('/:id', function(req, res) {
  Campground.findById(req.params.id).populate('comments').populate('detail').exec(function(err, foundCampground){
    if (err) {
      console.log(err);
    } else {
      res.render('campgrounds/show', {campground: foundCampground, detail: foundCampground.detail});
    }
  });
});

//Edit campground route
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res){
  Campground.findById(req.params.id, function(err, foundCampground){
    res.render("campgrounds/edit", {campground: foundCampground});
  });
});

// Update Camground Route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

// Destroy Campground Route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
  Campground.findByIdAndRemove(req.params.id, function(err){
    if (err) {
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds");
    };
  });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
