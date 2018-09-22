
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
router.post("/login", function(req, res) {
  passport.authenticate("local", function(err, user, info) {
    if (err) {
      req.flash("error", "Error occurred while trying to log in.");
      return res.redirect("/login");
    } else if (!user) {
      setTimeout(() => res.redirect("/login"), 5000);
    } else {
      req.login(user, function(err) {
        if (err) {
          req.flash("error", "Error occurred while trying to log in.");
          customLogout(req);
          return res.redirect("/login");
        } else {
          if (user.hasToken && user.totpToken && user.totpToken.verified && !req.session.tokenAuthenticated) {
            return res.redirect("/login/token");
          } else {
            req.session.tokenAuthenticated = true;
            return res.redirect("/lists");
          }
        }
      });
    }
  })(req, res);
});

// show enter token page
router.get("/login/token", function(req, res) {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  } else if (!req.session.tokenAuthenticated) {
    return res.render("auths/token");
  } else {
    return res.redirect("/lists");
  }
});

// authenticate token route
router.post("/login/token", function(req, res) {
  if (req.isAuthenticated() && req.session.tokenAuthenticated) {
    return res.redirect("/lists");
  } else if (req.isAuthenticated()) {
    User.findById(req.user._id, function(err, user) {
      if (err) {
        console.err(err);
        req.flash("error", "An error occurred while searching for the user in the database!");
        return res.redirect("/login");
      } else {
        if (req.body.tokenCode) {
          if (speakeasy.totp.verifyDelta({
            secret: user.totpToken.ascii,
            token: req.body.tokenCode,
            window: 1
          })["delta"] <= 0) {
            // token has been verified
            req.session.tokenAuthenticated = true;
            return res.redirect("/lists");
          } else {
            customLogout(req);
            req.flash("error", "Authentication failed! Please ensure values for username, password, and token (if applicable) are entered correctly.");
            setTimeout(() => res.redirect("/login"), 5000);
          }
        } else {
          req.flash("error", "Please enter a code to proceed!");
          return res.redirect("/login/token");
        }
      }
    });
  } else {
    return res.redirect("/login");
  }
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
