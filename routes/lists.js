
const express = require("express");
let router = express.Router();
let List = require("../models/list");
let Item = require("../models/item");

// INDEX ROUTE - list all lists
router.get("/", function(req, res) {
  List.find({}).populate("items").exec(function(err, lists) {
    if (err) {
      console.log(err);
    } else {
      res.render("lists/index", {lists: lists});
    }
  });
});

// NEW ROUTE - create new list form
router.get("/new", function(req, res) {
  res.render("lists/new");
});

// CREATE ROUTE - create post
router.post("/", function(req, res) {
  List.create(req.body.list, function(err, list) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/lists/" + list._id);
    }
  });
});

// SHOW ROUTE
router.get("/:id", function(req, res) {
  List.findById(req.params.id).populate("items").exec(function(err, list) {
    if (err) {
      console.log("An error occurred while loading the list with id: " + req.params.id + ", and the error is: " + err);
      res.redirect("/lists");
    } else if (!list) {
      console.log("List with id: " + req.params.id + " was not found!");
      res.redirect("/lists");
    } else {
      res.render("lists/show", {list: list});
    }
  });
});

// EDIT - show edit form
router.get("/:id/edit", function(req, res) {
  List.findById(req.params.id, function(err, list) {
    if (err || !list) {
      console.log(err);
      res.redirect("/lists");
    } else {
      res.render("lists/edit", {list: list});
    }
  });
});

// UPDATE - update the form
router.put("/:id", function(req, res) {
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
router.delete("/:id", function(req, res) {
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
