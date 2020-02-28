
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
  req.body.item.text = unescape(decodeURI(req.body.item.text));
  req.body.item.text = req.sanitize(req.body.item.text);
  // make sure item doesn't come in as undefined, that it is treated as empty if it does
  if (!req.body.item.text) {
    req.body.item.text = "";
  }
  if (req.body.item.completed !== "true" || req.body.item.completed !== "false") {
    req.body.item.completed = "false";
  }
  User.findById(req.user._id).populate({path: "lists", match: {_id: req.params.id}, options: {limit: 1}}).exec(function(err, user) {
    if (err) {
      console.error(err);
      return res.redirect("/lists");
    } else if (!user.lists || user.lists.length === 0) {
      // list does not exist, or user does not have access to it
      return res.status(404).send("List does not exist, or you are not authorized to add an item to it!");
    } else {
      Item.create(req.body.item, function(err, item) {
        if (err || !item) {
          console.error(err);
          res.redirect("/lists");
        } else {
          user.lists[0].items.push(item);
          user.lists[0].save();
          return res.status(200).send(item);
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
  req.body.item.text = unescape(decodeURI(req.body.item.text));
  req.body.item.text = req.sanitize(req.body.item.text);
  // make sure item doesn't come in as undefined, that it is treated as empty if it does
  if (!req.body.item.text) {
    req.body.item.text = "";
  }
  if (req.body.item.completed !== "true" && req.body.item.completed !== "false") {
    req.body.item.completed = "false";
  }
  User.findById(req.user._id).populate({
    path: "lists", 
    populate: {
      path: "items", 
      model: "Item"
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
      const items = user.lists[0].items;
      let itemIndex = -1;
      let item;
      for (let i = 0; i < user.lists[0].items.length; i++) {
        if (user.lists[0].items[i]._id.equals(req.params.itemId)) {
          itemIndex = i;
          item = user.lists[0].items[itemIndex];
        }
      }
      if (itemIndex == -1 || !item) {
        return res.status(404).send("The item does not exist.");
      }
      const completed = req.body.item.completed == "true";
      if (item.completed != completed) {
        user.lists[0].items.splice(itemIndex, 1);
        if (completed) {
          user.lists[0].items.push(item);
        } else {
          let indexFirstCompleted = user.lists[0].items.length;
          for (let i = 0; i < user.lists[0].items.length; i++) {
            if (user.lists[0].items[i].completed) {
              indexFirstCompleted = i;
              break;
            }
          }
          user.lists[0].items = user.lists[0].items.slice(0, indexFirstCompleted).concat(item).concat(user.lists[0].items.slice(indexFirstCompleted));
        }
        user.lists[0].save();
      }
      Item.findByIdAndUpdate(req.params.itemId, req.body.item, function(err, item) {
        if (err) {
          console.error(err);
          res.status(500).send("An error occurred while trying to retrieve the item data from the database.");
        } else if (!item) {
          res.status(404).send("The item does not exist."); // and we had just checked for this earlier...
        } else {
          return res.status(200).send(item);
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
          res.status(200).send();
        }
      });
    }
  });
});


module.exports = router;
