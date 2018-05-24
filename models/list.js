
const mongoose = require("mongoose");

let listSchema = new mongoose.Schema({
  name: String,
  description: String,
  items: [String]
});

module.exports = mongoose.model("lists", listSchema);
