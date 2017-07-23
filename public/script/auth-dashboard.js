var eventsListElem = document.querySelector("#events-list")

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var uid = user.uid
    firebase.database().ref("/users/" + uid).once("value").then(function(snapshot) {
      var events = snapshot.val()
      if (events) {
        for (let id of Object.keys(events)) {
          var event = events[id]
          var eventElem = document.createElement("li")
          eventElem.innerHTML = `
          <p>${event.title}</p>
          <p>${new Date(event.dateStart).toDateString()}</p>
          <a href="/auth/edit-event?id=${id}">Edit event</a>
          <a href="/event/${id}" target="_blank">View event</a>
          `
          eventsListElem.appendChild(eventElem)
        }
      } else {
        eventsListElem.innerHTML = "<li><p>No events.</p></li>"
      }
    })
  }
})
