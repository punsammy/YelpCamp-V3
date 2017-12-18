var mongoose = require('mongoose');

var detailSchema = new mongoose.Schema({
  name: String
});

module.exports = mongoose.model('Detail', detailSchema);
