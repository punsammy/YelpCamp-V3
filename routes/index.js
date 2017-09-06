var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var async = require("async");
var nodemailer = require("nodemailer");
var middleware = require("../middleware");
var crypto = require("crypto");

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
  var newUser = new User({username: req.body.username, email: req.body.email});
  User.register(newUser, req.body.password, function(err, user){
    if (err) {
      req.flash("error", err.message);
      return res.redirect("register");
    }
    //after registering user, automatically log them in
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

//forgot password route
router.get("/forgot", function(req, res){
  res.render("forgot");
});

router.post("/forgot", function(req, res, next) {
// waterfall is array of functions that get called one after anothe in orderr
  async.waterfall([
    function(done) {
      // create random token
      // convert token to string
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString("hex");
        done(err, token);
      });
    },
    function(token, done) {
      //find user by email
      User.findOne({email: req.body.email }, function(err, user) {
        if(!user) {
          req.flash("error", "No account with that email address exists");
          return res.redirect("/forgot");
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; //1 hour

        user.save(function(err){
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      //identify email and service from which emails will be sent from
      var smtpTransport = nodemailer.createTransport({
        service: "hotmail",
        auth: {
          user: "amanda.punsammy@live.ca",
          //password saved as local variable
          pass: process.env.GMAILPW

        }
      });
      var mailOptions = {
        // email text
        to: user.email,
        from: "amanda.punsammy@live.ca",
        subject: "YelpCamp Password Reset",
        text: "Hello,\n\n" +
        "You are receiving this because you (or someone else) has requested to reset your password on YelpCamp\n\n" +
        "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
        "http://" + req.headers.host + "/reset/" + user.resetPasswordToken + "\n\n" +
        "You have one hour. Duhhh duh duhhhhhh" +
        "If you did not request this, please ignore this email and your password will remain unchanged. \n\n"
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash("success", "An e-mail has been sent to " + user.email + "with further instructions.");
        done(err, "done");
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect("/forgot");
  });
});

//get reset route
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});


// reset post route
router.post('/reset/:token', function(req, res) {
  //using waterfall to ensure the results from each function is passed
  async.waterfall([
    function(done) {
      // find users using resetPasswordToken
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        //confirm that both passwords match
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            //save new password to user
            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      // set up email server and address
      var smtpTransport = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
          user: 'amanda.punsammy@live.ca',
          pass: process.env.GMAILPW
        }
      });
      //send confirmation email
      var mailOptions = {
        to: user.email,
        from: 'amanda.punsammy@live.ca',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campgrounds');
  });
});

module.exports = router;
