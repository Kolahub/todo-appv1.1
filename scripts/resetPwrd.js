import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "./firebase.js";

const auth = getAuth(app);

const emailInput = document.querySelector('.passInput');
const resetBtn = document.querySelector('.resetBtn');
const errMsg = document.querySelector('.error');
const errText = document.querySelector('.error-text');
const scsMsg = document.querySelector('.success');
const scsText = document.querySelector('.success-text');

resetBtn.addEventListener('click', function () {
    const email = emailInput.value;
    sendPasswordResetEmail(auth, email)
    .then(() => {
        scsMsg.classList.add('success-show');
        scsText.textContent = 'Password Reset Email Sent Successfully!';
        emailInput.value = ''; // Clear input after successful reset

        setTimeout(() => {
            scsMsg.classList.remove('success-show');
        }, 3000);

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 5000);
    })
    .catch((err) => {
        errMsg.classList.add('error-show');
        if (err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found') {
            errText.textContent = 'Error! Your email or password is invalid. Try again';
        } else if (err.code === 'auth/missing-email') {
            errText.textContent = 'Error! Missing email.';
        } else {
            errText.textContent = `${err.message}`;
        }

        setTimeout(() => {
            errMsg.classList.remove('error-show');
        }, 3000);
    });
});
