
const express = require("express");
let router = express.Router();
let List = require("../models/list");

// INDEX ROUTE - list all lists
router.get("/", function(req, res) {
  List.find({}, function(err, lists) {
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
  List.findById(req.params.id, function(err, list) {
    if (err) {
      console.log(err);
    } else {
      res.render("lists/show", {list: list});
    }
  });
});

// EDIT - show edit form
router.get("/:id/edit", function(req, res) {
  List.findById(req.params.id, function(err, list) {
    if (err) {
      console.log(err);
    } else {
      res.render("lists/edit", {list: list});
    }
  });
});

// UPDATE - update the form
router.put("/:id", function(req, res) {
  List.findByIdAndUpdate(req.params.id, req.body.list, function(err, list) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/lists/" + req.params.id);
    }
  });
});

// DESTROY >:[ ROUTE
router.delete("/:id", function(req, res) {
  List.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/lists");
    }
  });
});

module.exports = router;
