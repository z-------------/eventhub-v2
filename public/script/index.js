var emailInput = document.querySelector("#login-form [type=email]")
var passwordInput = document.querySelector("#login-form [type=password]")
var submitButton = document.querySelector("#login-form button")

submitButton.addEventListener("click", function(evt) {
  evt.preventDefault()

  var email = emailInput.value
  var password = passwordInput.value

  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(err) {
    console.log(err)
    if (err.code === "auth/user-not-found") {
      firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(err) {
        console.log(err)
      })
    }
  })
})

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    location.href = "auth/dashboard"
  }
})
