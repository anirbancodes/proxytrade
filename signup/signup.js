import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";

let btn = document.getElementById("signupBtn");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

btn.addEventListener("click", (e) => {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      await setDoc(
        doc(db, "users", user.email),
        {
          margin: 100000,
          holding: {},
          orders: [],
        },
        { merge: true }
      );

      alert("Done ! Press OK");
      window.location = "/";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
      // ..
    });
});
