
// MODULES
const express = require("express");
var app = express();


// SETTINGS
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"))


// ROUTES
app.use(require("./routes/index.js"));


// LISTEN
app.listen(process.env.PORT, process.env.IP, function() {
  console.log("ToDoList App started listening on port " + process.env.PORT);
});
