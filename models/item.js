
const mongoose = require("mongoose");

let itemSchema = new mongoose.Schema({
  text: String,
  completed: Boolean
});

module.exports = mongoose.model("Item", itemSchema);
