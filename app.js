var express        = require('express'),
    app            = express(),
    bodyParser     = require('body-parser'),
    mongoose       = require('mongoose'),
    passport       = require("passport"),
    LocalStrategy  = require("passport-local"),
    methodOverride = require("method-override"),
    Campground     = require('./models/campground'),
    Comment        = require('./models/comment'),
    User           = require("./models/user"),
    seedDb         = require('./seeds');
//Requiring Routes
var commentRoutes    = require("./routes/comments");
    campgroundRoutes = require("./routes/campgrounds");
    indexRoutes      = require("./routes/index");



mongoose.connect('mongodb://localhost/yelp_camp', {useMongoClient: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.set('view engine', 'ejs');
mongoose.Promise = global.Promise;
// seedDb();  //seed the database

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

app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is listening!");
});
