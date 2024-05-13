import { app } from "./firebase.js";
import { getAuth, sendEmailVerification, onAuthStateChanged } from "firebase/auth";

const auth = getAuth()

const errMsg = document.querySelector('.error')
const errText = document.querySelector('.error-text')
const scsMsg = document.querySelector('.success');
const scsText = document.querySelector('.success-text');

document.getElementById("resendLink").addEventListener("click", function(event) {
    event.preventDefault();
    emailVerification()
});

function emailVerification () {
  const userE = auth.currentUser;
// Check if the user is authenticated and their email is not verified
if (userE && !userE.emailVerified) {
  sendEmailVerification(userE)
  .then(() => {
scsMsg.classList.add('success-show')
scsText.textContent = 'Verification link sent successfully'
setTimeout(() => {
  scsMsg.classList.remove('success-show')
}, 4000)
  })
  .catch((err) => {
    errMsg.classList.add('success-show')
errText.textContent = `${err.message}`
setTimeout(() => {
  errText.classList.remove('success-show')
}, 4000)
  })
}
}

// window.addEventListener('load', function () {
//   emailVerification()
// })