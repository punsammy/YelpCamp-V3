var Campground = require("../models/campground");
var Comment = require("../models/comment");
//All Middleware goes here
var middlewareObj ={};

middlewareObj.checkCommentOwnership = function(req, res, next){
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function(err, foundComment){
      if (err) {
        red.redirect("back");
      } else {
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          res.redirect("back");
        }
      };
    });
  } else {
    res.redirect("back");
  }
}

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    //is user logged in
    Campground.findById(req.params.id, function(err, foundCampground){
      if (err) {
        res.redirect("back");
      } else {
        //does user own the campground
        if (foundCampground.author.id.equals(req.user._id)) {
          next();
        } else {
          res.redirect("back");
        }
      };
    });
  } else {
    res.redirect("back");
  }
}

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
  console.log("You need to be logged in to gain access");
}



 module.exports = middlewareObj;
