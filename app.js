
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
const mongo_host = "localhost"
const db_name = "todolist"
// Connect to Mongo database if it is up, error out if not
mongoose.connect("mongodb://" + mongo_host + "/" + db_name, {
  connectTimeoutMS: 5000
}, function(error) {
  console.log("Unable to connect to the Mongo database running on host " + mongo_host);
  console.log("Please verify it is up and running and accepting connections on port 27017.");
  console.log(error);
  process.exit();
});

// ============
// APP SETTINGS
// ============
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.disable('x-powered-by');
const PORT = process.env.PORT || 8080;
const IP = process.env.IP || "127.0.0.1";

// seed the database
require("./seeds.js")();

// ============
// ROUTES
// ============
app.use(require("./routes/index"));
app.use("/lists", require("./routes/lists"));
app.use("/lists/:id/items", require("./routes/items"));


// ============
// LISTEN
// ============
app.listen(PORT, IP, function() {
  console.log("ToDoList App started listening on port " + process.env.PORT);
});
