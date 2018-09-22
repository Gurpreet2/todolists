
const mongoose = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = mongoose.Schema({
  username: String,
  password: String,
  email: String,
  verifiedEmail: Boolean,
  lists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List"
    }
  ],
  totpToken: {
    ascii: String,
    hex: String,
    base32: String,
    otpauth_url: String,
    name: String,
    verifyByTime: Number,
    verifyAttemptsRemaining: Number,
    verified: {
      type: Boolean,
      default: false
    }
  },
  hasToken: {
    type: Boolean,
    default: false
  }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
