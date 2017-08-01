var express       = require('express'),
    app           = express(),
    bodyParser    = require('body-parser'),
    mongoose      = require('mongoose')


mongoose.connect('mongodb://localhost/yelp_camp', {useMongoClient: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

mongoose.Promise = global.Promise;


// Schema
var campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String
});

var Campground = mongoose.model('Campground', campgroundSchema);

// Campground.create(
//   {
//     name: 'Granite Hill',
//     image: 'https://farm4.staticflickr.com/3895/15030126225_9ef5b51e4a.jpg',
//     description: 'This is a huge granite hill, no bathrooms. No water. Beautiful granite!'
//   }, function(err, campground){
//     if (err) {
//       console.log(err);
//     } else {
//       console.log('NEWLY CREATED CAMPGROUND');
//       console.log(campground);
//     }
//   }
// );


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
      res.render('index', {campgrounds: allCampgrounds})
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
  res.render('new.ejs');
});

// show page - more info about one campground
app.get('/campgrounds/:id', function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground){
    if (err) {
      console.log(err);
    } else {
      res.render("show", {campground: foundCampground});
    }
  });
});


app.listen(process.env.PORT || 3000, function(){
  console.log("Server is listening!");
});
