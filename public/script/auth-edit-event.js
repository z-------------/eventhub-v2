var titleInput = document.querySelector("[name=title]");
var dateStartInput = document.querySelector("[name=date-start]")
var dateEndInput = document.querySelector("[name=date-end]")
var locationInput = document.querySelector("[name=location]")
var descriptionInput = document.querySelector("[name=description]")
var submitButton = document.querySelector("form button")

function parseDatetimeInput(datetimeString) {
  // yyyy-mm-ddThh:mm
  var year = Number(datetimeString.substring(0, 4))
  var month = Number(datetimeString.substring(5, 7))
  var day = Number(datetimeString.substring(8, 10))
  var hour = Number(datetimeString.substring(11, 13))
  var minute = Number(datetimeString.substring(14, 16))

  return new Date(year, month, day, hour, minute)
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var uid = user.uid

    submitButton.addEventListener("click", function(evt) {
      evt.preventDefault()

      var newEventInfo = {
        title: titleInput.value,
        dateStart: parseDatetimeInput(dateStartInput.value),
        dateEnd: parseDatetimeInput(dateEndInput.value),
        location: locationInput.value,
        description: descriptionInput.value
      }

      var updates = {};
      updates["/events/" + key] = Object.assign(newEventInfo, { ownerUID: uid })
      updates[`/users/${uid}/${key}`] = Object.assign(newEventInfo, { ownerUID: uid })

      return firebase.database().ref().update(updates);
    })
  }
})
