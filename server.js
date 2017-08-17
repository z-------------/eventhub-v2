const express = require("express")
const app = express()
const compression = require("compression")
const morgan = require("morgan")
const fs = require("fs")
const path = require("path")

const firebase = require("firebase")
firebase.initializeApp({
  apiKey: "AIzaSyCWJUN0C9iYA5sevGRi09__1FlwKPGqZPg",
  authDomain: "eventhub-7cde3.firebaseapp.com",
  databaseURL: "https://eventhub-7cde3.firebaseio.com",
  projectId: "eventhub-7cde3",
  messagingSenderId: "475074856016"
})

const fAdmin = require("firebase-admin")
const fServiceAccountKey = require(path.join(__dirname, "service_account_key.json"));
fAdmin.initializeApp({
  credential: fAdmin.credential.cert(fServiceAccountKey),
  databaseURL: "https://eventhub-7cde3.firebaseio.com"
});
const db = fAdmin.database()

const nodemailer = require("nodemailer")
const sgTransport = require("nodemailer-sendgrid-transport")
const mailTransporter = nodemailer.createTransport(sgTransport({
  auth: {
    api_key: process.env.SENDGRID_API_KEY
  }
}))
const MAIL_DEFAULTS = {
  from: '"Eventhub notifications" <eventhub.noreply@gmail.com>'
}

app.locals.basedir = path.join(__dirname, "views");
const PUG_VARS = {
  appName: "Eventhub"
}

const moment = require("moment")
const MOMENT_FORMAT = "MMMM Do YYYY, h:mm:ss a"
const MOMENT_FORMAT_BACKWARDS = "YYYY-MM-DD[T]HH:mm" // 2017-06-01T08:30 -- for datetime-local input elements

app.use(express.static("public"))
app.use(compression())
app.use(morgan("dev"))

app.set("view engine", "pug")

app.get("/", function(req, res) {
  res.render("index", Object.assign(PUG_VARS, { pageTitle: "Home" }))
})

app.get("/event/:eventID", function(req, res) {
  var eventID = req.params.eventID
  firebase.database().ref("/events/" + eventID).once("value").then(function(snapshot) {
    var event = snapshot.val()
    if (event) {
      res.render("event", Object.assign(PUG_VARS, {
        pageTitle: event.title,
        event: Object.assign(event, {
          id: eventID,
          dateStartFormatted: moment(new Date(event.dateStart)).format(MOMENT_FORMAT),
          dateEndFormatted: moment(new Date(event.dateEnd)).format(MOMENT_FORMAT)
        })
      }))
    } else {
      res.sendStatus(404)
    }
  })
})

app.get("/auth/dashboard", function(req, res) {
  res.render("auth/dashboard", Object.assign(PUG_VARS, { pageTitle: "Dashboard" }))
})

app.get("/auth/create-event", function(req, res) {
  res.render("auth/create-event.pug", Object.assign(PUG_VARS, { pageTitle: "Create event" }))
})

app.get("/auth/edit-event", function(req, res) {
  var eventID = req.query["id"]
  if (eventID && eventID.length !== 0) {
    firebase.database().ref("/events/" + eventID).once("value").then(function(snapshot) {
      var event = snapshot.val()
      if (event) {
        res.render("auth/edit-event", Object.assign(PUG_VARS, {
          pageTitle: "Edit event",
          event: Object.assign(event, {
            id: eventID,
            dateStartFormattedBackwards: moment(new Date(event.dateStart)).format(MOMENT_FORMAT_BACKWARDS),
            dateEndFormattedBackwards: moment(new Date(event.dateEnd)).format(MOMENT_FORMAT_BACKWARDS)
          })
        }))
      } else {
        res.sendStatus(404)
        console.log("could not find event with that id")
      }
    })
  } else {
    res.sendStatus(400)
    console.log("no event id supplied")
  }
})

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log(`listening on port ${port}`)
})

db.ref("events").on("child_changed", function(snapshot) {
  console.log(snapshot.val())
  var eventID = snapshot.key
  var event = snapshot.val()
  db.ref(`subscriptions/${eventID}`).once("value").then(function(snapshot) {
    var snapshotVal = snapshot.val()
    var keys = Object.keys(snapshotVal)

    for (let key of keys) {
      var subscriptionInfo = snapshotVal[key]
      var emailAddress;

      if (subscriptionInfo.hasOwnProperty("emailAddress")) {
        emailAddress = subscriptionInfo.emailAddress

        mailTransporter.sendMail(Object.assign(MAIL_DEFAULTS, {
          to: emailAddress,
          subject: `'${event.title}' was updated`,
          html: `<p><strong>${event.title}</strong> has been updated. Here are the latest details:</p>
            <ul>
              <li><strong>Title:</strong> ${event.title}</li>
              <li><strong>Date and time:</strong> ${moment(event.dateStart).format()} to ${moment(event.dateEnd).format()}</li>
              <li><strong>Location:</strong> ${event.location}</li>
              <li><strong>Description:</strong> ${event.description}</li>
            </ul>
            <p>You are receiving this notification because you are subscribed to '${event.title}'.</p>`
        }), function(err, info) {
          if (err) {
            return console.log(err)
          }
          console.log("Message sent.", info)
        })
      } else if (subscriptionInfo.hasOwnProperty("uid")) {
        fAdmin.auth().getUser(subscriptionInfo.uid)
          .then(function(userRecord) {
            console.log("Successfully fetched user data:", userRecord.toJSON())
            emailAddress = userRecord.email

            mailTransporter.sendMail(Object.assign(MAIL_DEFAULTS, {
              to: emailAddress,
              subject: `'${event.title}' was updated`,
              html: `<p><strong>${event.title}</strong> has been updated. Here are the latest details:</p>
                <ul>
                  <li><strong>Title:</strong> ${event.title}</li>
                  <li><strong>Date and time:</strong> ${moment(event.dateStart).format()} to ${moment(event.dateEnd).format()}</li>
                  <li><strong>Location:</strong> ${event.location}</li>
                  <li><strong>Description:</strong> ${event.description}</li>
                </ul>
                <p>You are receiving this notification because you are following '${event.title}'.</p>`
            }), function(err, info) {
              if (err) {
                return console.log(err)
              }
              console.log("Message sent.", info)
            })
          })
          .catch(function(err) {
            console.log("Error fetching user data:", err)
          })
      }
    }
  })
}, function (err) {
  console.log("The read failed: " + err.code)
});
