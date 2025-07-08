import { showHoldings } from "./old/signin.js";
import { loginStyle } from "./ui.js";

import { auth, onAuthStateChanged } from "./firebase.js";

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
