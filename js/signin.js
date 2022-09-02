import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";

let loginBtn = document.getElementById("loginBtn");
let logoutBtn = document.getElementById("logoutBtn");

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

loginBtn.addEventListener("click", (e) => {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  //user_margin.textContent = "";

  setPersistence(auth, browserSessionPersistence).then(() => {
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        loginStyle();
        showHoldings(user.email);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  });
});

logoutBtn.addEventListener("click", (e) => {
  signOut(auth)
    .then(() => {
      logoutStyle();
    })
    .catch((error) => {
      alert(error);
    });
});

function showUserInfo(email, margin) {
  user_email.textContent = email;
  user_margin.textContent = margin;
}

import {
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";

const db = getFirestore(app);

export async function showHoldings(email) {
  const ref = doc(db, "users", email);
  const docSnap = await getDoc(ref);
  if (docSnap.exists()) {
    let data = docSnap.data();
    let inv = data.inv;
    let margin = data.margin;
    let holding = data.holding;
    let orders = data.orders;
    showUserInfo(email, margin);
    holding_info(inv);
    let keysH = Object.keys(holding).sort();
    keysH.forEach((scrip) => {
      let [qty, avg] = holding[scrip];
      showEachHolding(scrip, qty, avg);
    });
    order_add_cards.innerHTML = "";
    if (orders) {
      orders.forEach((order) => {
        let name = Object.keys(order)[0];
        let [type, qty, avg, time] = order[name];
        showEachOrder(name, type, qty, avg, time);
      });
    }
  } else {
    alert("Please signup !");
  }
}
function holding_info(inv) {
  //fetch curr
  holding_add_cards.innerHTML =
    `<div class="holding-status">
<p id="holding_totInvested">Invested ₹ ` +
    inv +
    `</p>
<p id="holding_totCurrent">Current ₹ 0</p>
<p>
  P&L: <span id="holding_totpnl">0</span>(
  <span id="holding_totpnlprcnt">0</span>%)
</p>
</div>`;
}
function showEachHolding(scrip, qty, avg) {
  //fetch curr
  let ltp = 2000,
    inv = qty * avg,
    pnl = (ltp - avg) * qty,
    pnlpct = ((pnl / inv) * 100).toFixed(2);
  holding_add_cards.innerHTML +=
    `<div class="holding-card ` +
    (pnl >= 0 ? `green` : `red`) +
    `">
  <div class="holding-scrip">
    <p>` +
    scrip +
    `</p>
    <p>LTP ₹ ` +
    ltp +
    `</p>
    <p>₹ ` +
    pnl +
    ` (` +
    pnlpct +
    `%)</p>
  </div>
  <div class="holding-scrip-status">
    <p>Qty: ` +
    qty +
    `</p>
    <p>Avg: ₹ ` +
    avg +
    `</p>
    <p>Invested: ₹ ` +
    inv +
    `</p>
  </div>
</div>`;
}

function showEachOrder(name, type, qty, avg, time) {
  order_add_cards.innerHTML +=
    `<div class="holding-card ` +
    (type == "b" ? `green` : `red`) +
    `">
  <div class="holding-scrip">
    <p>` +
    (type == "b" ? `BUY` : `SELL`) +
    `</p>
    <p>` +
    name +
    `</p>
    <p>Qty ` +
    qty +
    ` @ ₹ ` +
    avg +
    `</p>
    <p>` +
    time +
    `</p>
  </div>
</div>`;
}
