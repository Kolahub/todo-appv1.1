import { app } from "./firebase.js";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged,
 } from "firebase/auth"
 import { toggleDarkLightMode } from "./toggleLightMode.js";


//initailize services
const db = getFirestore()
const auth = getAuth()
toggleDarkLightMode()

const errMsg = document.querySelector('.error')
const errText = document.querySelector('.error-text')
const scsMsg = document.querySelector('.success');
const scsText = document.querySelector('.success-text');
const signupBtn = document.querySelector('.signup-submit')
const loginBtn = document.querySelector('.login-submit')
const signupLoader = document.querySelector('.signup-loader')
const loginLoader = document.querySelector('.login-loader')

onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
        window.location.href = 'app.html';
    } 
})

//Signup
const signupForm = document.querySelector('.signup-form')
signupForm.addEventListener('submit', function (e) {
    e.preventDefault(); // prevent form submit
    const name = signupForm.name.value 
    const email = signupForm.email.value
    const password = signupForm.email.value

    signupLoader.classList.remove('hidden')
    signupBtn.style.pointerEvents = "none"; 



    createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
        signupLoader.classList.add('hidden');
        signupBtn.style.pointerEvents = "auto";
        console.log("Account created for user!", cred.user)
        const userRef = doc(db, 'userInfo', cred.user.uid)
        return setDoc(userRef, {
            displayName: name,
            avatarUrl: '',
            userDataArr: [],
            userDataLeft: 0
        })
    }).then(() => {
        return sendEmailVerification(auth.currentUser)
    }).then (() => {
        window.location.href = 'verify_email.html';
    })
    .catch ((err) => {
        errMsg.classList.add('error-show');
        errText.textContent = `${err.message}`;
        setTimeout(() => {
            errMsg.classList.remove('error-show');
            }, 3000)
    })

    signupLoader.classList.remove('hidden')
    signupBtn.style.pointerEvents = "none";
})

//LOGIN
const loginForm = document.querySelector(".login-form")
loginForm.addEventListener('submit', function (e) {
    e.preventDefault()
    const email = loginForm.email.value
    const password = loginForm.pswd.value

    loginLoader.classList.remove('hidden')
    loginBtn.style.pointerEvents = "none";


    signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
        
    })
    .catch(err => {
    loginLoader.classList.add('hidden')
    loginBtn.style.pointerEvents = "auto";
        errMsg.classList.add('error-show');
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
            errText.textContent = 'Error! Your email or password is incorrect. Try again';
        } else {
            errText.textContent = err.message;
        }

        setTimeout(() => {
        errMsg.classList.remove('error-show');
        }, 3000)
    })
})

const resetPwrd = document.querySelector('.reset-pswd')
resetPwrd.addEventListener('click', function () {
    window.location.href = 'resetPwrd.html';
})