const express = require("express")
const app = express()
const compression = require("compression")
const morgan = require("morgan")
const fs = require("fs")
const path = require("path")

const firebase = require("firebase")
const fApp = firebase.initializeApp({
  apiKey: "AIzaSyCWJUN0C9iYA5sevGRi09__1FlwKPGqZPg",
  authDomain: "eventhub-7cde3.firebaseapp.com",
  databaseURL: "https://eventhub-7cde3.firebaseio.com",
  projectId: "eventhub-7cde3",
  messagingSenderId: "475074856016"
})

app.locals.basedir = path.join(__dirname, "views");
const PUG_VARS = {
  appName: "Eventhub"
}

const moment = require("moment")
const MOMENT_FORMAT = "MMMM Do YYYY, h:mm:ss a"

app.use(express.static("public"))
app.use(compression())
app.use(morgan("dev"))

app.set("view engine", "pug")

app.get("/", function(req, res) {
  res.render("index", Object.assign(PUG_VARS, { pageTitle: "Home" }))
})

app.get("/event/:eventID", function(req, res) {
  firebase.database().ref("/events/" + req.params.eventID).once("value").then(function(snapshot) {
    var event = snapshot.val()
    if (event) {
      res.render("event", Object.assign(PUG_VARS, {
        pageTitle: event.title,
        event: Object.assign(event, {
          dateStartFormatted: moment(new Date(event.dateStart)).format(MOMENT_FORMAT),
          dateEndFormatted: moment(new Date(event.dateEnd)).format(MOMENT_FORMAT)
        })
      }))
    } else {
      res.error(404)
    }
  })
})

app.get("/auth/dashboard", function(req, res) {
  res.render("auth/dashboard", Object.assign(PUG_VARS, { pageTitle: "Dashboard" }))
})

app.get("/auth/create-event", function(req, res) {
  res.render("auth/create-event.pug", Object.assign(PUG_VARS, { pageTitle: "Create event" }))
})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log(`listening on port ${port}`);
})
