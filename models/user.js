
const mongoose = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = mongoose.Schema({
  username: String,
  password: String,
  lists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List"
    }
  ]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
