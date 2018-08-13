
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
  if (req.body.username.trim() == "" || req.body.password.trim() == "") {
    res.redirect("/register");
  } else {
    User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
      if (err) {
        console.log(err);
        return res.redirect("/register");
      } else {
        user.verifiedEmail = false;
        user.save();
        passport.authenticate("local")(req, res, function() {
          res.redirect("/lists");
        });
      }
    });
  }
});

// show login form
router.get("/login", function(req, res) {
  res.render("auths/login");
});

// handle login logic
router.post("/login", function(req, res, next) {
  passport.authenticate("local", function(err, user, info) {
    if (err) {
      return next(err);
    } else if (!user) {
      setTimeout(() => {res.redirect("/login")}, 5000);
    } else {
      req.login(user, function(err) {
        if (err) {
          return next(err);
        } else {
          return res.redirect("/lists");
        }
      });
    }
  })(req, res, next);
});

// logout route
router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

module.exports = router;
