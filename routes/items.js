
const express = require("express"),
      User = require("../models/user"),
      List = require("../models/list"),
      Item = require("../models/item"),
      middleware = require("../middleware");
const router = express.Router({mergeParams: true});


// INDEX ROUTE
router.get("/", function(req, res) {
  res.redirect("/lists/" + req.params.id);
});

// NEW ROUTE
// shown as form on lists show page

// CREATE ITEM, add to list
router.post("/", middleware.isLoggedIn, function(req, res) {
  User.findById(req.user._id).populate({path: "lists", match: {_id: req.params.id}, options: {limit: 1}}).exec(function(err, user) {
    if (err) {
      console.error(err);
      res.redirect("/lists");
    } else if (!user.lists || user.lists.length === 0) {
      // list does not exist, or user does not have access to it
      res.status(404).send("List does not exist, or you are not authorized to add an item to it!");
    } else {
      Item.create(req.body.item, function(err, item) {
        if (err || !item) {
          console.error(err);
          res.redirect("/lists");
        } else {
          user.lists[0].items.push(item);
          user.lists[0].save();
          res.redirect("/lists/" + req.params.id);
        }
      });
    }
  });
});

// SHOW route
// items will only be shown in lists

// EDIT route
// inside of lists show page

// UPDATE route
router.put("/:itemId", middleware.isLoggedIn, function(req, res) {
  // make sure user owns item
  User.findById(req.user._id).populate({
    path: "lists", 
    populate: {
      path: "items", 
      model: "Item", 
      match: {_id: req.params.itemId}, 
      options: {limit: 1}
    }, 
    match: {_id: req.params.id}, 
    options: {limit: 1}
  }).exec(function(err, user) {
    if (err) {
      console.error(err);
      res.redirect("/lists");
    } else if (!user.lists || user.lists.length === 0 || !user.lists[0].items || user.lists[0].items.length === 0) {
      // list or item does not exist, or user does not have access to it
      res.status(404).send("List or item does not exist, or you are not authorized to modify this item in the list!");
    } else {
      // update the item
      req.body.item.text = decodeURI(unescape(req.body.item.text));
      Item.findByIdAndUpdate(req.params.itemId, req.body.item, function(err, item) {
        if (err) {
          console.error(err);
          res.status(500).send("An error occurred while trying to retrieve the item data from the database.");
        } else if (!item) {
          res.status(404).send("The item does not exist."); // and we had just checked for this earlier...
        } else {
          res.status(200).send();
        }
      });
    }
  });
});

// DESTROY route
router.delete("/:itemId", middleware.isLoggedIn, function(req, res) {
  User.findById(req.user._id).populate({path: "lists", match: {_id: req.params.id}, options: {limit: 1}}).exec(function(err, user) {
    if (err) {
      console.error(err);
      res.redirect("/lists");
    } else if (!user.lists || user.lists.length === 0) {
      // list or item does not exist, or user does not have access to it
      res.status(404).send("List or item does not exist, or you are not authorized to remove this item from the list!");
    } else {
      Item.findByIdAndRemove(req.params.itemId, function(err, item) {
        if (err) {
          console.error(err);
          res.redirect("/lists");
        } else if (!item) {
          res.redirect("/lists/" + req.params.id);
        } else {
          
          user.lists[0].items.splice(user.lists[0].items.indexOf(item._id), 1);
          user.lists[0].save();
          res.redirect("/lists/" + req.params.id);
        }
      });
    }
  });
});


module.exports = router;
