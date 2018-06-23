
const express = require("express"),
      List = require("../models/list"),
      Item = require("../models/item"),
      middleware = require("../middleware");
const router = express.Router();

// INDEX ROUTE - list all lists
router.get("/", middleware.isLoggedIn, function(req, res) {
  List.find({author: {id: req.user._id, username: req.user.username}}).populate("items").exec(function(err, lists) {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      res.render("lists/index", {lists: lists});
    }
  });
});

// NEW ROUTE - create new list form
router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("lists/new");
});

// CREATE ROUTE - create post
router.post("/", middleware.isLoggedIn, function(req, res) {
  List.create(req.body.list, function(err, list) {
    if (err) {
      console.log(err);
    } else {
      list.author = {id: req.user._id, username: req.user.username};
      list.save();
      res.redirect("/lists/" + list._id);
    }
  });
});

// SHOW ROUTE
router.get("/:id", middleware.isLoggedIn, function(req, res) {
  List.findOne({_id: req.params.id, author: {id: req.user._id, username: req.user.username}}).populate("items").exec(function(err, list) {
    if (err) {
      console.log("An error occurred while loading the list with id: " + req.params.id + ", and the error is: " + err);
      res.redirect("/lists");
    } else if (!list || list.length == 0) {
      console.log("List with id: " + req.params.id + " was not found, or user does not have access to it.");
      res.redirect("/lists");
    } else {
      res.render("lists/show", {list: list});
    }
  });
});

// EDIT - show edit form
router.get("/:id/edit", middleware.isLoggedIn, function(req, res) {
  List.findOne({_id: req.params.id, author: {id: req.user._id, username: req.user.username}}, function(err, list) {
    if (err || !list) {
      console.log(err);
      res.redirect("/lists");
    } else {
      res.render("lists/edit", {list: list});
    }
  });
});

// UPDATE - update the list
router.put("/:id", middleware.isLoggedIn, function(req, res) {
  // make sure user owns the list
  List.findOne({_id: req.params.id, author: {id: req.user._id, username: req.user.username}}, function(err, list) {
    if (err) {
      console.log(err);
      res.redirect("/lists");
    } else {
      if (!list) {
        res.redirect("/lists");
        return;
      }
    }
  });
  // update the list
  List.findByIdAndUpdate(req.params.id, req.body.list, function(err, list) {
    if (err || !list) {
      console.log(err);
      res.redirect("/lists");
    } else {
      res.redirect("/lists/" + req.params.id);
    }
  });
});

// DESTROY >:[ ROUTE
router.delete("/:id", middleware.isLoggedIn, function(req, res) {
  // make sure user owns the list
  List.findOne({_id: req.params.id, author: {id: req.user._id, username: req.user.username}}, function(err, list) {
    if (err) {
      console.log(err);
      res.redirect("/lists");
    } else {
      if (!list) {
        res.redirect("/lists");
        return;
      }
    }
  });
  // delete the list
  List.findByIdAndRemove(req.params.id, function(err, list) {
    if (err || !list) {
      console.log(err);
      res.redirect("/lists");
    } else {
      // delete all the items in the list
      list.items.forEach(function(item) {
        Item.findByIdAndRemove(item, function(err, item) {
          if (err) {
            console.log(err);
          }
        });
      });
      res.redirect("/lists");
    }
  });
});

module.exports = router;
