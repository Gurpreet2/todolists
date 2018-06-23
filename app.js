
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
      User = require("./models/user");
var app = express();


// ============
// DATABASE SETTINGS
// ============
const mongo_host = "localhost"
const db_name = "todolist"
// Connect to Mongo database if it is up, error out if not
mongoose.connect("mongodb://" + mongo_host + "/" + db_name, {
  connectTimeoutMS: 5000
}, function(err) {
  if (err) {
    console.log("Unable to connect to the Mongo database running on host " + mongo_host);
    console.log("Please verify it is up and running and accepting connections on port 27017.");
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
app.listen(PORT, IP, function() {
  console.log("ToDoList App started listening on port " + process.env.PORT);
});
