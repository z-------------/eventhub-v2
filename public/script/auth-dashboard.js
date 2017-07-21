firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var uid = user.uid
    firebase.database().ref("/users/" + uid).once("value").then(function(snapshot) {
      console.log(snapshot.val())
    })
  }
})
