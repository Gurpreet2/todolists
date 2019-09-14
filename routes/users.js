
const express = require("express"),
      User = require("../models/user"),
      middleware = require("../middleware"),
      emailValidator = require("email-validator"),
      router = express.Router(),
      speakeasy = require("speakeasy"),
      QRCode = require('qrcode');

// get user profile page
router.get("/", middleware.isLoggedIn, function(req, res) {
  return res.render("users/show");
});

// get user profile edit page
router.get("/edit", middleware.isLoggedIn, function(req, res) {
  return res.render("users/edit");
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
  return res.redirect("/profile");
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
          // show QR code to user
          totpToken.name = issuer + " (" + label + ")";
          req.session.totpToken = totpToken;
          return res.render("users/qrcode/new", {qrcode: data_url});
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
      // if user already has a token, display error
      if (user.hasToken) {
        req.flash("error", "You already have a token associated with your account! Please delete the existing token before adding a new one!");
        return res.redirect("/profile");
      }
      // if token doesn't exist, return error
      if (!req.session.totpToken) {
        req.flash("error", "The token that needs to be verified doesn't exist!");
        return res.redirect("/profile");
      }
      // check that verification attempts is less than 1, and time limit to verify has not passed, and verify token
      if (req.session.totpToken.verifyAttemptsRemaining > 0 && (new Date()).getTime() < req.session.totpToken.verifyByTime) {
        req.session.totpToken.verifyAttemptsRemaining = req.session.totpToken.verifyAttemptsRemaining - 1;
        if (speakeasy.totp.verify({
          secret: req.session.totpToken.ascii,
          token: req.body.tokenCode,
          window: 1,
          algorithm: "sha512"
        })) {
          // token has been verified
          req.session.totpToken.verified = true;
          delete req.session.totpToken.verifyByTime;
          delete req.session.totpToken.verifyAttemptsRemaining;
          user.totpToken = req.session.totpToken;
          user.hasToken = true;
          delete req.session.totpToken;
          user.save();
          req.flash("success", "Token verified!");
        } else {
          if (req.session.totpToken.verifyAttemptsRemaining > 0) {
            req.flash("error", "Unable to verify token! Attempts remaining: " + req.session.totpToken.verifyAttemptsRemaining);
          } else {
            req.flash("error", "Unable to verify token! No attempts remaining! Please try adding a new token.");
          }
        }
        return res.redirect("/profile");
      } else {
        req.flash("error", "Token verification attempts exceeded, or unable to verify in time! Please try again.");
        delete req.session.totpToken;
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
        delete user.totpToken;
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
