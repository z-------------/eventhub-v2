var subscribeEmailInput = document.querySelector(".event-subscribe input[type=email]")
var subscribeEmailButton = document.querySelector(".event-subscribe button.event-subscribe_button-nonauthed")
var followButton = document.querySelector(".event-subscribe button.event-subscribe_button-authed")

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    followButton.addEventListener("click", function(evt) {
      evt.preventDefault()
      
      var key1 = firebase.database().ref().child(`subscriptions/${eventID}`).push().key

      var updates = {}
      updates[`subscriptions/${eventID}/${key1}`] = {
        uid: user.uid
      }
      updates[`users/${user.uid}/following/${eventID}`] = {
        subscriptionID: key1
      }

      return firebase.database().ref().update(updates);
    })
  } else {
    subscribeEmailButton.addEventListener("click", function(evt) {
      evt.preventDefault()

      if (subscribeEmailButton.matches(":valid")) {
        console.log("valid email address supplied")

        var emailAddress = subscribeEmailInput.value

        var key = firebase.database().ref().child(`subscriptions/${eventID}`).push().key

        var updates = {}
        updates[`/subscriptions/${eventID}/${key}`] = {
          emailAddress: emailAddress
        }

        return firebase.database().ref().update(updates);
      } else {
        console.log("invalid email address supplied")
      }
    })
  }
})