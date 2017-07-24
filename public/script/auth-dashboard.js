var eventsListElem = document.querySelector("#events-list")
var eventsFollowingListElem = document.querySelector("#following-list")

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var uid = user.uid
    
    firebase.database().ref(`/users/${uid}/events`).once("value").then(function(snapshot) {
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
        eventsListElem.innerHTML = "<li><p>You haven't created any events.</p></li>"
      }
    })
    
    firebase.database().ref(`/users/${uid}/following`).once("value").then(function(snapshot) {
      var snapshotVal = snapshot.val()
      console.log(snapshotVal)
      if (snapshotVal && Object.keys(snapshotVal).length !== 0) {
        var eventIDs = Object.keys(snapshotVal)
        for (let eventID of eventIDs) {
          firebase.database().ref(`/events/${eventID}`).once("value").then(function(snapshot) {
            var event = snapshot.val()
            if (event) {
              var eventElem = document.createElement("li")
              eventElem.innerHTML = `
              <p>${event.title}</p>
              <p>${new Date(event.dateStart).toDateString()}</p>
              <a href="#" class="event-unfollow-button" data-event-id="${eventID}">Unfollow event</a>
              <a href="/event/${eventID}" target="_blank">View event</a>
              `
              eventsFollowingListElem.appendChild(eventElem)
            }
          })
        }
      } else {
        eventsFollowingListElem.innerHTML = "<li><p>You don't follow any events.</p></li>"
      }
    })
    
    eventsFollowingListElem.addEventListener("click", function(evt) {
      console.log(evt.target)
      if (evt.target.matches(".event-unfollow-button")) {
        var eventID = evt.target.dataset["eventId"]

        var userFollowingRef = firebase.database().ref(`/users/${user.uid}/following/${eventID}`)
        userFollowingRef.once("value").then(function(snapshot) {
          var snapshotVal = snapshot.val()
          if (snapshotVal) {
            var subscriptionID = snapshotVal.subscriptionID
            var subscriptionRef = firebase.database().ref(`/subscriptions/${eventID}/${subscriptionID}`)
            
            userFollowingRef.remove()
            subscriptionRef.remove()
          }
        })
      }
    })
  }
})
