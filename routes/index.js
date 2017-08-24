var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware");

//root route
router.get('/', function(req, res) {
  res.render('landing');
});

// =========
//AUTH ROUTES
// =========

//show register form
router.get("/register", function(req,res) {
  res.render("register");
});
//Handle sign up logic
router.post("/register", function(req, res){
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, user){
    if (err) {
      req.flash("error", err.message);
      return res.redirect("register");
    }
    passport.authenticate("local")(req, res, function(){
      req.flash("success", "Welcome to YelpCamp " + user.username)
      res.redirect("/campgrounds");
    });
  });
});

// login Routes
router.get("/login", function(req,res){
  res.render("login");
});
//handling login logic
//uses passport-local-mongoose to authenticate user using whats in database(local), then redirects
router.post("/login", passport.authenticate("local",
  {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true
  }), function(req, res){
});

//logout route
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/campgrounds");
});

module.exports = router;
