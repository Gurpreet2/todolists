
// ============
// MODULES
// ============
const express = require("express"),
      mongoose = require("mongoose"),
      bodyParser = require("body-parser"),
      methodOverride = require("method-override"),
      passport = require("passport"),
      LocalStrategy = require("passport-local"),
      crypto = require("crypto"),
      User = require("./models/user"),
      expressSanitizer = require("express-sanitizer"),
      fs = require("fs");
var app = express();


// ============
// DATABASE SETTINGS
// ============
const dbUrl = process.env.DATABASE_URL || "mongodb://localhost/todolist";
// Connect to Mongo database if it is up, error out if not
mongoose.connect(dbUrl, {
  connectTimeoutMS: 5000
}, function(err) {
  if (err) {
    console.log("Unable to connect to the Mongo database instance at " + dbUrl.split("@")[1]);
    console.log("Please verify it is up and running!");
    console.log(err);
    process.exit();
  }
});


// Passport Settings
app.use(require("express-session")({
  secret: crypto.randomBytes(32).toString("base64"),
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});


// ============
// APP SETTINGS
// ============
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.disable('x-powered-by');
const PORT = process.env.PORT || 8080;
const IP = process.env.IP || "127.0.0.1";

// seed the database
//require("./seeds.js")();

// ============
// ROUTES
// ============
app.use(require("./routes/index"));
app.use(require("./routes/auths"));
app.use("/lists", require("./routes/lists"));
app.use("/lists/:id/items", require("./routes/items"));


// ============
// LISTEN
// ============
const port = process.env.PORT || 8080;
const ip = process.env.IP || "0.0.0.0";
console.log(port);
console.log(ip);
console.log(process.env.PORT);
module.exports = app.listen(port, ip, function() {
  console.log("ToDoList App started listening on port " + process.env.PORT);
});
