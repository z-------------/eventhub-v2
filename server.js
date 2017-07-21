const express = require("express")
const app = express()
const compression = require("compression")
const morgan = require("morgan")
const fs = require("fs")
const path = require("path")

app.locals.basedir = path.join(__dirname, "views");

const PUG_VARS = {
  appName: "Eventhub"
}

app.use(express.static("public"))
app.use(compression())
app.use(morgan("dev"))

app.set("view engine", "pug")

app.get("/", function(req, res) {
  res.render("index", Object.assign(PUG_VARS, { pageTitle: "Home" }));
})

app.get("/auth/dashboard", function(req, res) {
  res.render("auth/dashboard", Object.assign(PUG_VARS, { pageTitle: "Dashboard" }));
})

app.get("/auth/create-event", function(req, res) {
  res.render("auth/create-event.pug", Object.assign(PUG_VARS, { pageTitle: "Create event" }));
})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log(`listening on port ${port}`);
})
