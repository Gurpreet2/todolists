
const express = require("express"),
      User = require("../models/user"),
      passport = require("passport"),
      router = express.Router(),
      speakeasy = require("speakeasy");

// show register page route
router.get("/register", function(req, res) {
  res.render("auths/register");
});

// handle sign up logic
router.post("/register", function(req, res) {
  if (req.body.username.trim() == "" || req.body.password.trim() == "") {
    req.flash("error", "Cannot create user with only whitespace characters in name!");
    return res.redirect("/register");
  } else {
    User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
      if (err) {
        console.log(err);
        req.flash("error", err.message);
        return res.redirect("/register");
      } else {
        user.verifiedEmail = false;
        user.save();
        passport.authenticate("local")(req, res, function() {
          req.session.tokenAuthenticated = true;
          return res.redirect("/lists");
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
router.post("/login", function(req, res) {
  passport.authenticate("local", function(err, user, info) {
    if (err) {
      req.flash("error", "System error occurred while trying to log in.");
      return res.redirect("/login");
    } else if (!user) {
      req.flash("error", "Authentication failed! Please ensure values for username, password, and token (if applicable) are entered correctly.");
      return setTimeout(() => res.redirect("/login"), 5000);
    } else {
      req.login(user, function(err) {
        if (err) {
          req.flash("error", "System error occurred while trying to log in.");
          customLogout(req);
          return res.redirect("/login");
        } else {
          if (req.body.tokenCode || (user.hasToken && user.totpToken && user.totpToken.verified && !req.session.tokenAuthenticated)) {
            const tokenVerified = speakeasy.totp.verifyDelta({
              secret: user.totpToken.ascii,
              token: req.body.tokenCode,
              window: 1,
              algorithm: "sha512"
            });
            if (tokenVerified && tokenVerified["delta"] <= 0) {
              // token has been verified
              req.session.tokenAuthenticated = true;
              return res.redirect("/lists");
            } else {
              customLogout(req);
              req.flash("error", "Authentication failed! Please ensure values for username, password, and token (if applicable) are entered correctly.");
              return setTimeout(() => res.redirect("/login"), 5000);
            }
          } else {
            req.session.tokenAuthenticated = true;
            return res.redirect("/lists");
          }
        }
      });
    }
  })(req, res);
});

// logout route
router.get("/logout", function(req, res) {
  customLogout(req);
  res.redirect("/");
});

// functions
function customLogout(req) {
  req.session.tokenAuthenticated = undefined;
  req.logout();
}

module.exports = router;
