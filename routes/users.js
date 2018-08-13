
const express = require("express"),
      User = require("../models/user"),
      middleware = require("../middleware"),
      emailValidator = require("email-validator"),
      router = express.Router();

// get user profile page
router.get("/profile", middleware.isLoggedIn, function(req, res) {
  res.render("users/show");
});

// get user profile edit page
router.get("/profile/edit", middleware.isLoggedIn, function(req, res) {
  res.render("users/edit");
});

// patch request to update user
router.put("/profile", middleware.isLoggedIn, function(req, res) {
  // if updating email
  if (req.body.email && emailValidator.validate(req.body.email)) {
    User.findByIdAndUpdate(req.user._id, {email: req.body.email}, function(err, user) {
      if (err) {
        console.log(err);
      }
    });
  }
  // if updating password
  if (req.body.newPassword && req.body.oldPassword) {
    User.findById(req.user._id, function(err, user) {
      if (err) {
        console.log(err);
      } else {
        user.changePassword(req.body.oldPassword, req.body.newPassword, function(err) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  }
  res.redirect("/profile");
});

// delete request to delete user (TODO eventually)

module.exports = router;
