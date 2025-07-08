import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-auth.js";
import { loginStyle, logoutStyle } from "./ui.js";
import { showHoldings } from "./holdings.js";
import { auth } from "./firebase.js";

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

loginBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  setPersistence(auth, browserSessionPersistence)
    .then(() => signInWithEmailAndPassword(auth, email, password))
    .then((userCredential) => {
      const user = userCredential.user;
      loginStyle();
      showHoldings(user.email);
    })
    .catch((error) => {
      console.log(error.code, error.message);
    });
});

logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(logoutStyle)
    .catch((error) => alert(error));
});
