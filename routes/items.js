
const express = require("express"),
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
  List.findOne({_id: req.params.id, author: {id: req.user._id, username: req.user.username}}, function(err, list) {
    if (err || !list) {
      console.log(err);
      res.redirect("/lists");
    } else {
      Item.create(req.body.item, function(err, item) {
        if (err || !item) {
          console.log(err);
          res.redirect("/lists");
        } else {
          item.author = {id: req.user._id, username: req.user.username};
          item.save();
          list.items.push(item);
          list.save();
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
  Item.findOne({_id: req.params.itemId, author: {id: req.user._id, username: req.user.username}}, function(err, item) {
    if (err) {
      console.log(err);
      res.redirect("/lists");
    } else {
      if (!item) {
        res.redirect("/lists");
        return;
      }
    }
  });
  // update the item
  req.body.item.text = decodeURI(unescape(req.body.item.text));
  Item.findByIdAndUpdate(req.params.itemId, req.body.item, function(err, item) {
    if (err) {
      res.status(500).send("An error occurred while trying to retrieve the item data from the database.");
    } else if (!item) {
      res.status(404).send("The item does not exist.");
    } else {
      res.status(200).send();
    }
  });
});

// DESTROY route
router.delete("/:itemId", middleware.isLoggedIn, function(req, res) {
  // make sure user owns item
  Item.findOne({_id: req.params.itemId, author: {id: req.user._id, username: req.user.username}}, function(err, item) {
    if (err) {
      console.log(err);
      res.redirect("/lists");
    } else {
      if (!item) {
        res.redirect("/lists");
        return;
      }
    }
  });
  // remove item from items collection
  Item.findByIdAndRemove(req.params.itemId, function(err, item) {
    if (err || !item) {
      console.log(err);
    } else {
      // remove item from list
      List.findById(req.params.id, function(err, list) {
        if (err || !list) {
          console.log(err);
        } else {
          for (let i = 0; i < list.items.length; i++) {
            if (list.items[i]._id.equals(item._id)) {
              list.items.splice(i, 1);
              list.save()
              break;
            }
          }
          res.redirect("/lists/" + req.params.id);
        }
      });
    }
  });
});


module.exports = router;
