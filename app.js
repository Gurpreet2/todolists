
// ============
// MODULES
// ============
const express = require("express"),
      app = express(),
      mongoose = require("mongoose"),
      bodyParser = require("body-parser"),
      methodOverride = require("method-override"),
      passport = require("passport"),
      LocalStrategy = require("passport-local"),
      crypto = require("crypto"),
      User = require("./models/user"),
      expressSanitizer = require("express-sanitizer"),
      flash = require("connect-flash"),
      session = require("express-session"),
      MongoStore = require("connect-mongo")(session),
      fs = require("fs");


// ============
// DATABASE SETTINGS
// ============
const dbUrl = process.env.DATABASE_URL || "mongodb://localhost/todolist";
// Connect to Mongo database if it is up, error out if not
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useFindAndModify", false);
mongoose.connect(dbUrl, {
  connectTimeoutMS: 5000
}, function(err) {
  if (err) {
    console.log("Unable to connect to the Mongo database instance at " + (dbUrl.split("@")[1] || dbUrl));
    console.log("Please verify it is up and running!");
    console.log(err);
    process.exit();
  }
});

// ============
// Get secret
// ============
let secret = process.env.SESSION_SECRET;
if (!secret) {
  try {
    fs.accessSync("./.private/secret.js", fs.constants.R_OK);
    secret = require("./.private/secret.js").secret;
  } catch (err) {
    secret = crypto.randomBytes(32).toString("base64");
    try {
      fs.accessSync(".", fs.constants.W_OK);
      if (!fs.existsSync("./.private")) {
        fs.mkdirSync("./.private");
      }
      fs.writeFileSync("./.private/secret.js", "module.exports={secret:'" + secret + "'}");
    } catch (err2) {
      console.log("Secrets file does not exist, and cannot create it! Using generated secret.");
    }
  }
}


// ============
// Passport Settings
// ============
app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 3 * 24 * 60 * 60,
    autoRemove: 'disabled',
    secret: secret
  })
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ============
// APP SETTINGS
// ============
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(flash());
app.disable('x-powered-by');


// ============
// MIDDLEWARE
// ============
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});


// seed the database
//require("./seeds.js")();

// ============
// ROUTES
// ============
app.use(require("./routes/index"));
app.use(require("./routes/auths"));
app.use("/profile", require("./routes/users"));
app.use("/lists", require("./routes/lists"));
app.use("/lists/:id/items", require("./routes/items"));


// ============
// LISTEN
// ============
const port = process.env.PORT || 8080;
const ip = process.env.IP || "0.0.0.0";
module.exports = app.listen(port, ip, function() {
  console.log("ToDoList App started listening on port " + process.env.PORT);
});
