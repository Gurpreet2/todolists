
const express = require("express"),
      User = require("../models/user"),
      List = require("../models/list"),
      Item = require("../models/item"),
      middleware = require("../middleware");
const router = express.Router();

// INDEX ROUTE - list all lists
router.get("/", middleware.isLoggedIn, function(req, res) {
  // find and display all lists owned by the user
  // only retrieve first four items in each list (only first 3 are displayed anyway, saves page size)
  User.findById(req.user._id).populate({path: "lists", populate: {path: "items", model: "Item", options: {limit: 4}}}).exec(function(err, user) {
    if (err) {
      console.error(err);
    } else {
      if (err) {
        console.error(err);
        res.redirect("/");
      } else {
        res.render("lists/index", {lists: user.lists});
      }
    }
  });
});

// NEW ROUTE - create new list form
router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("lists/new");
});

// CREATE ROUTE - create post
router.post("/", middleware.isLoggedIn, function(req, res) {
  User.findById(req.user._id, function(err, user) {
    if (err) {
      console.error(err);
    } else {
      // create list and save to user.lists
      List.create(req.body.list, function(err, list) {
        if (err) {
          console.error(err);
        } else {
          user.lists.push(list);
          user.save();
          res.redirect("/lists/" + list._id);
        }
      });
    }
  });
});

// SHOW ROUTE
router.get("/:id", middleware.isLoggedIn, function(req, res) {
  // get list details
  User.findById(req.user._id).populate({path: "lists", populate: {path: "items", model: "Item"}, match: {_id: req.params.id}, options: {limit: 1}}).exec(function(err, user) {
    if (err) {
      console.error(err);
      res.redirect("/lists");
    } else if (!user.lists || user.lists.length === 0) {
      // list does not exist, or user does not have access to it
      res.status(404).send("List does not exist, or you are not authorized to view it!");
    } else {
      res.render("lists/show", {list: user.lists[0]});
    }
  });
});

// EDIT - show edit form
router.get("/:id/edit", middleware.isLoggedIn, function(req, res) {
  User.findById(req.user._id).populate({path: "lists", match: {_id: req.params.id}, options: {limit: 1}}).exec(function(err, user) {
    if (err) {
      console.error(err);
      res.redirect("/lists");
    } else if (!user.lists || user.lists.length == 0) {
      // list does not exist, or user does not have access to it
      res.status(404).send("List does not exist, or you are not authorized to edit it!");
    } else {
      res.render("lists/edit", {list: user.lists[0]});
    }
  });
});

// UPDATE - update the list
router.put("/:id", middleware.isLoggedIn, function(req, res) {
  // make sure user owns the list
  User.findById(req.user._id).populate({path: "lists", match: {_id: req.params.id}, options: {limit: 1}}).exec(function(err, user) {
    if (err) {
      console.error(err);
      res.redirect("/lists");
    } else if (!user.lists || user.lists.length == 0) {
      // list does not exist, or user does not have access to it
      res.status(404).send("List does not exist, or you are not authorized to modify it!");
    } else {
      // update the list
      List.findByIdAndUpdate(req.params.id, req.body.list, function(err, list) {
        if (err) {
          console.error(err);
        } else {
          res.redirect("/lists/" + req.params.id);
        }
      });
    }
  });
});

// DESTROY >:[ ROUTE
router.delete("/:id", middleware.isLoggedIn, function(req, res) {
  User.findByIdAndUpdate(req.user._id, {"$pull": {"lists": req.params.id}}, function(err, user) {
    if (err) {
      console.error(err);
    } else {
      List.findByIdAndRemove(req.params.id, function(err, list) {
        if (err) {
          console.error(err);
        } else {
          res.redirect("/lists");
        }
      });
    }
  });
});

module.exports = router;
