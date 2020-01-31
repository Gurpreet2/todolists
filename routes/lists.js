
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
  req.body.list.name = req.sanitize(req.body.list.name);
  req.body.list.description = req.sanitize(req.body.list.description);
  // make sure list name or description don't come in as undefined, that they are treated as empty if they do
  if (!req.body.list.name) {
    req.body.list.name = "";
  }
  if (!req.body.list.description) {
    req.body.list.description = "";
  }
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
  req.body.list.name = req.sanitize(req.body.list.name);
  req.body.list.description = req.sanitize(req.body.list.description);
  // make sure list name or description don't come in as undefined, that they are treated as empty if they do
  if (!req.body.list.name) {
    req.body.list.name = "";
  }
  if (!req.body.list.description) {
    req.body.list.description = "";
  }
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

// UPDATE 2 - Move an item in the list
router.put("/:id/moveItem", middleware.isLoggedIn, function(req, res) {
  const itemId = req.sanitize(req.body.itemId);
  // negative moveNum moves item up, positive moveNum moves it down
  const moveNum = Number(req.sanitize(req.body.moveNum));
  if (isNaN(moveNum)) {
    console.err("Problem with request to move item in list: moveNum is not a number, actual (sanitized) value: " + req.sanitize(req.body.moveNum));
    return res.status(400).send("An error occurred trying to move the item in the list.");
  }
  User.findById(req.user._id).populate({path: "lists", match: {_id: req.params.id}, options: {limit: 1}}).exec(function(err, user) {
    if (err) {
      console.err(err);
      return res.status(500).send("An error occurred while trying to lookup user and find actioned list.");
    } else if (!user.lists || user.lists.length == 0) {
      // list does not exist, or user does not have access to it
      return res.status(404).send("List does not exist, or you are not authorized to update it!");
    } else {
      const items = user.lists[0].items;
      let itemIndex = -1;
      // find the item in the list
      for (let i = 0; i < items.length; i++) {
        if (items[i]._id.equals(itemId)) {
          itemIndex = i;
          break;
        }
      }
      if (itemIndex === -1) {
        return res.status(404).send("Item not found in list!");
      }
      // reorder the list
      const item = items[itemIndex];
      let targetIndex = itemIndex + moveNum;
      if (targetIndex < 0) {
        targetIndex = 0;
      }
      if (targetIndex > items.length - 1) {
        targetIndex = items.length - 1;
      }
      const itemsWithRemovedItem = items.slice(0,itemIndex).concat(items.slice(itemIndex+1));
      const finalItems = itemsWithRemovedItem.slice(0,targetIndex).concat(item).concat(itemsWithRemovedItem.slice(targetIndex));
      user.lists[0].items = finalItems;
      user.lists[0].save();
      res.status(200).send("Item moved successfully.");
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
