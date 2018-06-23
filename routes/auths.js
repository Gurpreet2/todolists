
const express = require("express"),
      User = require("../models/user"),
      passport = require("passport");
const router = express.Router();

// show register page route
router.get("/register", function(req, res) {
  res.render("auths/register");
});

// handle sign up logic
router.post("/register", function(req, res) {
  User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      return res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/lists");
      });
    }
  });
});

// show login form
router.get("/login", function(req, res) {
  res.render("auths/login");
});

// handle login logic
router.post("/login", passport.authenticate("local", 
  {
    successRedirect: "/lists",
    failureRedirect: "/login"
  }), function(req, res) {
  });

// logout route
router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

module.exports = router;
