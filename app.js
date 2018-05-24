
// ============
// MODULES
// ============
const express = require("express"),
      mongoose = require("mongoose"),
      bodyParser = require("body-parser"),
      methodOverride = require("method-override");
var app = express();


// ============
// DATABASE SETTINGS
// ============
mongoose.connect("mongodb://localhost/todolist");
var List = require("./models/list");

// ============
// APP SETTINGS
// ============
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));


// seed the database
require("./seeds.js")();

// ============
// ROUTES
// ============
app.use(require("./routes/index"));
app.use("/lists", require("./routes/lists"));


// ============
// LISTEN
// ============
app.listen(process.env.PORT, process.env.IP, function() {
  console.log("ToDoList App started listening on port " + process.env.PORT);
});
