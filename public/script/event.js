var subscribeEmailInput = document.querySelector(".event-subscribe input[type=email]")
var subscribeEmailButton = document.querySelector(".event-subscribe button")

subscribeEmailButton.addEventListener("click", function(evt) {
  evt.preventDefault()
  
  if (subscribeEmailButton.matches(":valid")) {
    console.log("valid email address supplied")
  
    var emailAddress = subscribeEmailInput.value
    
    var key = firebase.database().ref().child(`subscriptions/${eventID}`).push().key

    var updates = {}
    updates[`/subscriptions/${eventID}/${key}`] = emailAddress

    return firebase.database().ref().update(updates);
  } else {
    console.log("invalid email address supplied")
  }
})