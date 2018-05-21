
const express = require("express");

let router = express.Router();

// base route
router.get("/", function(req, res) {
  res.render("index");
});

module.exports = router;
