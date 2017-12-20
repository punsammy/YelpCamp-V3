var mongoose = require('mongoose');

var detailSchema = new mongoose.Schema({
  text: {}
});

module.exports = mongoose.model('Detail', detailSchema);
