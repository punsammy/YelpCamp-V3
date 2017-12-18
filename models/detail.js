var mongoose = require('mongoose');

var detailSchema = new mongoose.Schema({
  text: String
});

module.exports = mongoose.model('Detail', detailSchema);
