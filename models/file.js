var mongoose = require('mongoose');

var fileSchema = new mongoose.Schema({
  name: String
});

module.exports = mongoose.model('Yelpfile', fileSchema);
