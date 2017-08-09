var express       = require('express'),
    app           = express(),
    bodyParser    = require('body-parser'),
    mongoose      = require('mongoose'),
    passport      = require("passport"),
    LocalStrategy = require("passport-local"),
    Campground    = require('./models/campground'),
    Comment       = require('./models/comment'),
    User          = require("./models/user"),
    seedDb        = require('./seeds');


mongoose.connect('mongodb://localhost/yelp_camp', {useMongoClient: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
seedDb();
mongoose.Promise = global.Promise;

//Passport Configuration
app.use(require("express-session")({
  secret: "Shakti wins cutest bird!",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// function will be called on every route
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});

app.get('/', function(req, res) {
  res.render('landing');
});

// Restful Routes!!!!!!
// index route
app.get('/campgrounds', function(req, res) {
  Campground.find({}, function(err, allCampgrounds){
    if (err) {
      console.log(err);
    } else {
      res.render('campgrounds/index', {campgrounds: allCampgrounds})
    }
  });
});

// create - add new campground to DB
app.post('/campgrounds', function(req, res) {
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
app.get('/campgrounds/new', function(req, res) {
  res.render('campgrounds/new');
});

// show page - more info about one campground
app.get('/campgrounds/:id', function(req, res) {
  Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
    if (err) {
      console.log(err);
    } else {
      res.render('campgrounds/show', {campground: foundCampground});
    }
  });
});

// ================
// COMMENTS ROUTES
// ================

// CREATE

//NEW
app.get('/campgrounds/:id/comments/new', isLoggedIn, function(req, res) {
  Campground.findById(req.params.id, function(err, campground){
    if (err) {
      console.log(err);
    } else {
      res.render('comments/new', {campground: campground});
    }
  });
});

app.post('/campgrounds/:id/comments', isLoggedIn, function(req, res) {
  Campground.findById(req.params.id, function(err, campground){
    if (err) {
      console.log(err);
      res.redirect('/campgrounds');
    } else {
      Comment.create(req.body.comment, function(err, comment){
        if (err) {
          console.log(err);
        } else {
          campground.comments.push(comment);
          campground.save();
          res.redirect('/campgrounds/' + campground._id);
        }
      });
    }
  });
});

// ==========
//AUTH Routes
// ==========

//show register form
app.get("/register", function(req,res) {
  res.render("register");
});
//Handle sign up logic
app.post("/register", function(req, res){
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function(){
      res.redirect("/campgrounds");
    });
  });
});

// login Routes
app.get("/login", function(req,res){
  res.render("login");
});
//handling login logic
//uses passport-local-mongoose to authenticate user using whats in database(local), then redirects
app.post("/login", passport.authenticate("local",
  {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
  }), function(req, res){
});

//logout route
app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
  console.log("You need to be logged in to gain access");
}

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is listening!");
});
