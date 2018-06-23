
const mongoose = require("mongoose");

let listSchema = new mongoose.Schema({
  name: String,
  description: String,
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item"
    }
  ],
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  }
});

module.exports = mongoose.model("lists", listSchema);
