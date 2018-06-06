
const mongoose = require("mongoose");

let listSchema = new mongoose.Schema({
  name: String,
  description: String,
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item"
    }
  ]
});

module.exports = mongoose.model("lists", listSchema);
