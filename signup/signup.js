import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-auth.js";

let btn = document.getElementById("signupBtn");

import { db, auth, doc, setDoc } from "../js/firebase.js";

btn.addEventListener("click", (e) => {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      await setDoc(
        doc(db, "users", user.email),
        {
          margin: 100000,
          holding: {},
          orders: [],
          inv: 0,
        },
        { merge: true }
      );

      // alert("Done ! Press OK");
      window.location = "/";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
      alert(error.message);
      // ..
    });
});
