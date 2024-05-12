import { app } from "./firebase.js";
import { getAuth, sendEmailVerification } from "firebase/auth";

const auth = getAuth()

document.getElementById("resendLink").addEventListener("click", function(event) {
    event.preventDefault();
const userE = auth.currentUser;




// Check if the user is authenticated and their email is not verified
if (userE && !userE.emailVerified) {
  return sendEmailVerification(userE)
}

});