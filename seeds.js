var mongoose = require('mongoose');
var Campground = require('./models/campground');
var Comment = require('./models/comment');

var data = [
  {
    name: "Muskoka",
    image: "https://farm4.staticflickr.com/3895/15030126225_9ef5b51e4a.jpg",
    description: "blah blah blah"
  },
  {
    name: "Cloud's Rest",
    image: "https://farm9.staticflickr.com/8471/8137270056_21d5be6f52.jpg",
    description: "allalaalalallalala"
  },
  {
    name: "Daisy Mountain",
    image: "https://farm8.staticflickr.com/7168/6670258309_2e52bdbc6c.jpg",
    description: "hahahahahahaa"
  },
  {
    name: "Lakelands",
    image: "https://farm4.staticflickr.com/3805/9667057875_90f0a0d00a.jpg",
    description: "tingalingtingslangngjkhjkhsgjkfh"
  },
]


function seedDB() {
  //remove campgrounds
  Campground.remove({}, function(err){
    if (err) {
      console.log(err);
    }
    console.log('removed campgrounds');
    //add campgrounds
    data.forEach(function(seed){
      Campground.create(seed, function(err, campground){
        if (err) {
          console.log(err);
        } else {
          console.log("added a campground");
          //create comment
          Comment.create({
            text: "This is a great place! But no internet",
            author: "Homer"
          }, function(err, comment){
            if (err) {
              console.log(err);
            } else {
              campground.comments.push(comment);
              campground.save();
              console.log("created new comment");
            }
          });
        }
      });
    });
  });
}

module.exports = seedDB;
