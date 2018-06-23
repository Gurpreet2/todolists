
const mongoose = require("mongoose");

let itemSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  }
});

module.exports = mongoose.model("Item", itemSchema);
