import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD54Zg7CnnoW-G6B02eqnLmKC9RoIU466Q",
    authDomain: "todo-app-bf04d.firebaseapp.com",
    projectId: "todo-app-bf04d",
    storageBucket: "todo-app-bf04d.appspot.com",
    messagingSenderId: "492648266979",
    appId: "1:492648266979:web:a622d872235cf5f68f19d6"
  };
  
  // Initialize Firebase
export const app = initializeApp(firebaseConfig);