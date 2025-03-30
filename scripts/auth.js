import { app } from "./firebase.js";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { toggleDarkLightMode } from "./toggleLightMode.js";

//initailize services
const db = getFirestore();
const auth = getAuth();
toggleDarkLightMode();

const errMsg = document.querySelector(".error");
const errText = document.querySelector(".error-text");
const scsMsg = document.querySelector(".success");
const scsText = document.querySelector(".success-text");
const signupBtn = document.querySelector(".signup-submit");
const loginBtn = document.querySelector(".login-submit");
const signupLoader = document.querySelector(".signup-loader");
const loginLoader = document.querySelector(".login-loader");

onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) {
    window.location.href = "app.html";
  }
});

// Initialize tab behavior
const initTabs = () => {
  const checkbox = document.getElementById("chk");
  const signupTab = document.getElementById("signup-tab");
  const loginTab = document.getElementById("login-tab");

  if (checkbox && signupTab && loginTab) {
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        signupTab.classList.remove("active");
        loginTab.classList.add("active");
      } else {
        signupTab.classList.add("active");
        loginTab.classList.remove("active");
      }
    });
  }
};

// Initialize theme toggle
const initThemeToggle = () => {
  const button = document.querySelector("[data-theme-toggle]");
  if (!button) return;

  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = localStorage.getItem("theme");

  if (currentTheme === "light") {
    document.body.setAttribute("data-theme", "light");
    button.innerHTML = '<i class="fas fa-sun"></i>';
  } else if (currentTheme === "dark" || prefersDarkScheme.matches) {
    document.body.setAttribute("data-theme", "dark");
    button.innerHTML = '<i class="fas fa-moon"></i>';
  }

  button.addEventListener("click", function () {
    let theme;
    if (document.body.getAttribute("data-theme") === "light") {
      document.body.setAttribute("data-theme", "dark");
      theme = "dark";
      button.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      document.body.setAttribute("data-theme", "light");
      theme = "light";
      button.innerHTML = '<i class="fas fa-sun"></i>';
    }
    localStorage.setItem("theme", theme);
  });
};

// Initialize password toggle
const initPasswordToggle = () => {
  const toggles = document.querySelectorAll(".password-toggle");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const input = this.previousElementSibling;

      // Toggle between password and text type
      if (input.type === "password") {
        input.type = "text";
        this.classList.remove("fa-eye");
        this.classList.add("fa-eye-slash");
      } else {
        input.type = "password";
        this.classList.remove("fa-eye-slash");
        this.classList.add("fa-eye");
      }
    });
  });
};

// Run initializations
initTabs();
initThemeToggle();
initPasswordToggle();

//Signup
const signupForm = document.querySelector(".signup-form");
signupForm.addEventListener("submit", function (e) {
  e.preventDefault(); // prevent form submit
  const name = signupForm.name.value;
  const email = signupForm.email.value;
  const password = signupForm.pswd.value; // Fixed - was using email value for password

  // Clear any existing error messages
  errMsg.classList.remove("error-show");

  // Show loader and disable button
  signupBtn.classList.add("loading");
  signupLoader.classList.remove("hidden");
  signupBtn.disabled = true;
  signupBtn.style.pointerEvents = "none";

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log("Account created for user!", cred.user);
      const userRef = doc(db, "userInfo", cred.user.uid);
      return setDoc(userRef, {
        displayName: name,
        avatarUrl: "",
        userDataArr: [],
        userDataLeft: 0,
      });
    })
    .then(() => {
      return sendEmailVerification(auth.currentUser);
    })
    .then(() => {
      window.location.href = "verify_email.html";
    })
    .catch((err) => {
      // Hide loader and re-enable button on error
      signupLoader.classList.add("hidden");
      signupBtn.classList.remove("loading");
      signupBtn.disabled = false;
      signupBtn.style.pointerEvents = "auto";

      errMsg.classList.add("error-show");
      errText.textContent = `${err.message}`;
      setTimeout(() => {
        errMsg.classList.remove("error-show");
      }, 3000);
    });
});

//LOGIN
const loginForm = document.querySelector(".login-form");
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.pswd.value;

  // Clear any existing error messages
  errMsg.classList.remove("error-show");

  // Show loader and disable button
  loginBtn.classList.add("loading");
  loginLoader.classList.remove("hidden");
  loginBtn.disabled = true;
  loginBtn.style.pointerEvents = "none";

  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      if (cred.user.emailVerified) {
        window.location.href = "app.html";
      } else {
        // Hide loader and re-enable button if email not verified
        loginLoader.classList.add("hidden");
        loginBtn.classList.remove("loading");
        loginBtn.disabled = false;
        loginBtn.style.pointerEvents = "auto";

        errMsg.classList.add("error-show");
        errText.textContent = "Please verify your email first.";
        setTimeout(() => {
          errMsg.classList.remove("error-show");
        }, 3000);
      }
    })
    .catch((err) => {
      // Hide loader and re-enable button on error
      loginLoader.classList.add("hidden");
      loginBtn.classList.remove("loading");
      loginBtn.disabled = false;
      loginBtn.style.pointerEvents = "auto";

      errMsg.classList.add("error-show");
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found"
      ) {
        errText.textContent =
          "Error! Your email or password is incorrect. Try again";
      } else {
        errText.textContent = err.message;
      }

      setTimeout(() => {
        errMsg.classList.remove("error-show");
      }, 3000);
    });
});

const resetPwrd = document.querySelector(".reset-pswd");
resetPwrd.addEventListener("click", function () {
  window.location.href = "resetPwrd.html";
});
