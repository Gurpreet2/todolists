
const express = require("express"),
      User = require("../models/user"),
      middleware = require("../middleware"),
      emailValidator = require("email-validator"),
      router = express.Router(),
      speakeasy = require("speakeasy"),
      QRCode = require('qrcode');

// get user profile page
router.get("/", middleware.isLoggedIn, function(req, res) {
  res.render("users/show");
});

// get user profile edit page
router.get("/edit", middleware.isLoggedIn, function(req, res) {
  res.render("users/edit");
});

// put request to update user
router.put("/", middleware.isLoggedIn, function(req, res) {
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

// add new QR code
router.get("/qrcode/new", middleware.isLoggedIn, function(req, res) {
  User.findById(req.user._id, function(err, user) {
    if (err) {
      console.err(err);
      req.flash("error", "An unknown error occurred while looking for the user in the database!");
      return res.redirect("/profile");
    } else {
      // if QR code already exists, return error that existing code should be deleted first
      if (user.hasToken) {
        req.flash("error", "A token already exists for this user! Please delete existing token before proceeding.");
        return res.redirect("/profile");
      }
      
      // generate QR code (default length is 32), and url
      const totpToken = speakeasy.generateSecret({length: 32});
      // only allow it to be verified for a certain amount of time
      totpToken.verifyByTime = (new Date()).getTime() + 60000;
      // add a verification attempts remaining variable
      totpToken.verifyAttemptsRemaining = 1;
      // add a verified variable
      totpToken.verified = false;
      // display to user, along with box that asks user to enter verification code
      const issuer = 'app-todolists.herokuapp.com';
      const label = req.user.username;
      const url = speakeasy.otpauthURL({ secret: totpToken.ascii, issuer: issuer, label: label, algorithm: 'sha512' });
      QRCode.toDataURL(url, function(err, data_url) {
        if (err) {
          console.err(err);
          req.flash("error", "An unknown error occurred while creating the QR code!");
          return res.redirect("/profile");
        } else {
          // save QR code
          User.findByIdAndUpdate(req.user._id, {totpToken: totpToken}, function(err, user) {
            if (err) {
              console.err(err);
              req.flash("error", "An unknown error occurred while looking for user in the database!");
              return res.redirect("/profile");
            } else {
              // Display this data URL to the user in an <img> tag
              user.hasToken = true;
              user.totpToken.name = issuer + " (" + label + ")";
              user.save();
              return res.render("users/qrcode/new", {qrcode: data_url});
            }
          });
        }
      });
    }
  });
});

// verify qr code
router.post("/qrcode/verify", middleware.isLoggedIn, function(req, res) {
  User.findById(req.user._id, function(err, user) {
    if (err) {
      console.err(err);
      req.flash("error", "An unknown error occurred while looking for the user in the database!");
      return res.redirect("/profile");
    } else {
      // if token doesn't exist, return error
      if (!user.hasToken) {
        req.flash("error", "The token that needs to be verified doesn't exist!");
        return res.redirect("/profile");
      }
      // check if token needs to be verified
      if (!user.totpToken.verified) {
        // check that verification attempts is less than 1, and time limit to verify has not passed, and verify token
        if (user.totpToken.verifyAttemptsRemaining > 0 && (new Date()).getTime() < user.totpToken.verifyByTime) {
          user.totpToken.verifyAttemptsRemaining = user.totpToken.verifyAttemptsRemaining - 1;
          if (speakeasy.totp.verify({ 
            secret: user.totpToken.ascii,
            token: req.body.tokenCode,
            delta: Math.floor(((user.totpToken.verifyByTime - (new Date()).getTime()) / 30000) + 1)
          })) {
            // token has been verified
            user.totpToken.verified = true;
            delete user.totpToken.verifyByTime;
            delete user.totpToken.verifyAttemptsRemaining;
            user.save();
            req.flash("success", "Token verified!");
          } else {
            if (user.totpToken.verifyAttemptsRemaining > 0) {
              req.flash("error", "Unable to verify token! Attempts remaining: " + user.totpToken.verifyAttemptsRemaining);
            } else {
              req.flash("error", "Unable to verify token! No attempts remaining! Please try adding a new token.");
            }
          }
          res.redirect("/profile");
        } else {
          req.flash("error", "Token verification attempts exceeded, or unable to verify in time! Please try again.");
          user.totpToken = null;
          user.save();
          return res.redirect("/profile");
        }
      } else {
        req.flash("error", "Token has already been verified!");
        return res.redirect("/profile");
      }
    }
  });
});

// delete qr code
router.delete("/qrcode", middleware.isLoggedIn, function(req, res) {
  User.findById(req.user._id, function(err, user) {
    if (err) {
      console.err(err);
      req.flash("error", "An unknown error occurred while looking for the user in the database!");
      return res.redirect("/profile");
    } else {
      if (user.hasToken) {
        // token exists, delete it
        user.totpToken = undefined;
        user.hasToken = false;
        user.save();
        req.flash("success", "Token was deleted successfully.");
      } else {
        req.flash("error", "User does not have a token.");
      }
      return res.redirect("/profile");
    }
  });
});

module.exports = router;
