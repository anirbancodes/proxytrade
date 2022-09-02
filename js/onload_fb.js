import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";
import { showHoldings } from "./signin.js";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginStyle();
    showHoldings(user.email);
    console.log("signed in already");
  } else {
    logoutStyle();
    console.log("no user signed in");
  }
});
