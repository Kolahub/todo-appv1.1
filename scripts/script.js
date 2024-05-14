import { app } from "./firebase.js";
import {getFirestore, onSnapshot, doc, getDoc, updateDoc, arrayUnion, arrayRemove,
} from "firebase/firestore";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { toggleDarkLightMode } from "./toggleLightMode.js";

const auth = getAuth();
const db = getFirestore();
toggleDarkLightMode();

const inputData = document.querySelector(".inputData");
const taskBox = document.querySelector(".taskBox");
const listLeft = document.querySelector(".listLeft");
const clearBtn = document.querySelector(".clear");
const taskInfo = document.querySelector(".taskInfo");
const profileTnfo = document.querySelector(".profile-info-box");
// const profile = document.querySelector(".profile");
const profilePic = document.querySelector(".profilePic");
const profileOverlay = document.querySelector(".profile-overlay");
const pageLoader = document.querySelector(".loader-overlay");

let selectedProfileImg;
let listLeftValue, userInfoRef;

function readFileAsDataURL(file, callback) {
  /**
   * Reads a file as a data URL and invokes a callback function with the result.
   *
   * @param {File} file - The file to be read.
   * @param {function} callback - The callback function to be invoked with the data URL result.
   * @returns {void}
   */

  const reader = new FileReader();
  reader.onloadend = function () {
    callback(reader.result);
  };
  reader.readAsDataURL(file);
}

function logUserOut () {
  signOut(auth)
  .then(() => {
    window.location.href = "index.html";
    // console.log("Signed out");
  })
  .catch((err) => {
    console.log(err.message);
  });
// console.log("Signed out");
}

// LOGOUT ON CLICK
const logout = document.querySelector(".logout");
logout.addEventListener("click", function () {
  logUserOut()
});

let timer = setTimeout(() => {
  logUserOut()
}, 1000 * 20)

function resetTimer() {
  clearTimeout(timer)
  timer = setTimeout(() => {
    logUserOut()
  }, 1000 * 20)
}


pageLoader.classList.remove("hidden");

onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) {
    userInfoRef = doc(db, "userInfo", user.uid);

    onSnapshot(userInfoRef, (snapshot) => {
      displayItems(snapshot.data().userDataArr);
      listLeftValue = snapshot.data().userDataLeft;
      listLeft.textContent = `${listLeftValue}`;

      profileInfoDisplay(userInfoRef, user);

      //Show Drag info text when the to-do list is greater two
      showDragContent(snapshot.data().userDataArr.length);

      //CLEAR ALL THE TODO LISTS
      document.querySelectorAll(".clear--all").forEach((btn) => {
        btn.addEventListener("click", async function () {
          await updateDoc(userInfoRef, {
            userDataArr: [],
            userDataLeft: 0,
          });
          taskInfo.classList.remove("bordertp");
        });
      });
      pageLoader.classList.add("hidden");
    });
  }
});

profilePic.addEventListener("click", function () {
  profileOverlay.classList.remove("hidden");
});

profileOverlay.addEventListener("click", function (e) {
  if (e.target.classList.contains("profile-overlay")) {
    e.target.classList.add("hidden");
  }
});

let profileImgLoader;

//User Profile Display
async function profileInfoDisplay(ref, user) {
  let html = "";
  const docSnap = await getDoc(ref);

  if (docSnap.exists()) {
    html = `<div class="profile-img">
    <div class="profile-img-loader hidden"></div>
    <img src=${
      docSnap.data().avatarUrl || "../images/userii.png"
    } alt="" id="fileImgDisplay">
  </div>
  <div class ='profile-btn'>
  <label for="file-upload" class="custom-file-upload">
  Change Avatar
 </label>

 <div class='remove-avt'>Remove Avatar</div>
  </div>
  <input id="file-upload" class="file-upload-input" type="file" accept="image/*" />
  <div class="profile-info">
    <p class="profile-name">Name: <span>${docSnap.data().displayName}</span></p>
    <p class="profile-email">Email: <span>${user.email}</span></p>
  </div>`;
  }
  profileTnfo.innerHTML = html;
  profilePic.src = docSnap.data().avatarUrl || "../images/userii.png";

  profileImgLoader = document.querySelector(".profile-img-loader");

  chooseNewAvatar();
  delCurAvatar();
}

//Updates user Avatar when new Image is Selected
async function updateAvatar(src) {
  profileImgLoader.classList.remove("hidden");
  await updateDoc(userInfoRef, {
    avatarUrl: src,
  });
  profileImgLoader.classList.add("hidden");
}

//Delete current Avatar
async function delAvatar() {
  profileImgLoader.classList.remove("hidden");
  await updateDoc(userInfoRef, {
    avatarUrl: "",
  });
  profileImgLoader.classList.add("hidden");
}

//Choose New Avatar From File
function chooseNewAvatar() {
  const imgFile = document.querySelector("#file-upload");
  imgFile.addEventListener("change", function () {
    const file = imgFile.files[0];
    readFileAsDataURL(file, function (dataURL) {
      selectedProfileImg = dataURL;
      updateAvatar(selectedProfileImg);
      console.log("acfghjk");
    });
  });
}

//Remove Current Avater from UI
function delCurAvatar() {
  const delAvtBtn = document.querySelector(".remove-avt");
  delAvtBtn.addEventListener("click", function () {
    delAvatar();
  });
}

//Add new a to-do list to user acc
async function setList(newList) {
  await updateDoc(userInfoRef, {
    userDataArr: arrayUnion({ el: newList, completed: false }),
  });
}

//Turn on the completed flag (completed = true)
async function markAscompleted(newList) {
  const docSnap = await getDoc(userInfoRef);
  if (docSnap.exists()) {
    const userDataArr = docSnap.data().userDataArr;
    const findLi = userDataArr.findIndex((el) => el.el === newList);
    if (findLi !== -1) {
      userDataArr[findLi].completed = true;
      await updateDoc(userInfoRef, {
        userDataArr: userDataArr,
      });
      // console.log("Added to completed list:", newList);
    }
  }
}

//Turn off the completed flag (completed = flag)
async function unmarkCompleted(newList) {
  const docSnap = await getDoc(userInfoRef);
  if (docSnap.exists()) {
    const userDataArr = docSnap.data().userDataArr;
    const findLi = userDataArr.findIndex((el) => el.el === newList);
    if (findLi !== -1) {
      userDataArr[findLi].completed = false;
      await updateDoc(userInfoRef, {
        userDataArr: userDataArr,
      });
      // console.log("Added to completed list:", newList);
    }
  }
}

//Remove a to-do list to user acc (when completed or not)
async function removeList(listToRmv) {
  const docSnap = await getDoc(userInfoRef);
  if (docSnap.exists()) {
    let bol;
    const userDataArr = docSnap.data().userDataArr;
    const findLi = userDataArr.findIndex((el) => el.el === listToRmv);
    if (findLi !== -1) {
      bol = userDataArr[findLi].completed;
      if (!bol) {
        decreaseListLeft();
      }
      await updateDoc(userInfoRef, {
        userDataArr: arrayRemove({ el: listToRmv, completed: bol }),
      });
    }
  }
}

//Increase items left in the to-do lists
async function increaseListLeft() {
  const numLeft = listLeftValue + 1;
  console.log(numLeft, listLeftValue, "Added LEFT");
  await updateDoc(userInfoRef, {
    userDataLeft: numLeft,
  });
}

//Decrease items left in the to-do lists
async function decreaseListLeft() {
  const numLeft = listLeftValue - 1;
  await updateDoc(userInfoRef, {
    userDataLeft: numLeft,
  });
}

//Add a Task Functiuonality
document.addEventListener("keyup", (e) => {
  if (e.key === "Enter" && inputData.value !== "") {
    const item = document.querySelector(".inputData");
    createItem(item);
    inputData.value = "";
  }
});

//This Function will show the .drag content if the itemsArray is > 1
function showDragContent(lgt) {
  if (lgt >= 2) {
    document.querySelector(".drag").classList.remove("hidden");
  } else {
    document.querySelector(".drag").classList.add("hidden");
  }
}

//This function will add todo-list to web page
function displayItems(arr) {
  let items = "";
  arr.forEach(function (value) {
    items =
      `
        <div class="taskList d-flex flex-grow align-items-center p-3" draggable="true">
        <div class="check ${value.completed ? "checked" : ""}">
        </div>
    
          <p class="taskText ${
            value.completed ? "taskText--checked" : ""
          } d-block mb-0">
          ${value.el}
          </p>
    
        <div class="removeTask">
          <img src="../images/icon-cross.svg" alt="" class="removeTaskPic">
        </div>
      </div>
        ` + items;
  });

  taskBox.innerHTML = items;
  activateDeleteListeners();

  if (taskBox.innerHTML !== "") {
    taskInfo.classList.add("bordertp");
  } else {
    taskInfo.classList.remove("bordertp");
  }
}

//This function add the checked styles to the list that is checked, also it updates the number of the itemsLefts
function activateCheckListeners() {
  taskBox.addEventListener("click", function (e) {
    if (e.target.classList.contains("check")) {
      e.target.classList.toggle("checked");
      const taskText = e.target.closest(".taskList").querySelector(".taskText");
      const listItem = taskText.textContent.trim();
      if (e.target.classList.contains("checked")) {
        markAscompleted(listItem);
        decreaseListLeft();
      } else {
        unmarkCompleted(listItem);
        increaseListLeft();
      }
    }
  });
}

//This Function delete and task from the todo lists
function activateDeleteListeners() {
  taskBox.addEventListener("click", function (e) {
    if (e.target.classList.contains("removeTaskPic")) {
      let li = e.target.closest(".taskList").querySelector(".taskText");
      deleteItem(li.textContent.trim());
      console.log(li.textContent.trim());
    }
  });
}

//Function create and displays a new task lisk
function createItem(item) {
  setList(item.value);
  increaseListLeft();
}

// The activateDeleteListeners Function is dependent on this to remove/delete a function from the lists
function deleteItem(i) {
  removeList(i);
}

// Clears All the Completed Todo Lists
clearBtn.addEventListener("click", function () {
  const checkedTasks = document.querySelectorAll(".taskText--checked");
  checkedTasks.forEach((task, i) => {
    removeList(task.textContent.trim());
  });
});

//Enables Drag and Drop to Reorder Todo lists Using the Sortable.js library
document.addEventListener("DOMContentLoaded", function () {
  activateCheckListeners();

  // Initialize Sortable
  new Sortable(taskBox, {
    animation: 150, // Animation duration in milliseconds (optional)
    swap: true, // Enable the swap feature
    onEnd: function (evt) {
      // Callback function called when the user stopped sorting and the DOM has been updated
      console.log("Element was moved:", evt.item);
    },
  });
});

// would reset the timer for Loging user out
window.onload = resetTimer;
window.onmousemove = resetTimer;
window.onmousedown = resetTimer;
window.ontouchstart = resetTimer;
window.onclick = resetTimer;
window.onkeypress = resetTimer;
