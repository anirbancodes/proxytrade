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
  user_margin.textContent = "₹ " + margin.toFixed(2);
}

import {
  getFirestore,
  increment,
  getDoc,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";

const db = getFirestore(app);

import { getPrice } from "./getPrice.js";
import { fetchData } from "../fetchPrice.js";

export async function showHoldings(email) {
  let addFundsBtn = document.getElementById("addFunds");
  addFundsBtn.addEventListener("click", async (e) => {
    await updateDoc(
      doc(db, "users", email),
      {
        margin: increment(10000),
      },
      { merge: true }
    );
    window.location = "/";
    // let margin = document.getElementById("user_margin");
    // margin.innerHTML =
    //   "₹ " +
    //   (Number(margin.innerHTML.substring(margin.innerHTML.indexOf("₹ ") + 1)) +
    //     10000);
    // console.log(margin.innerHTML.substring(margin.innerHTML.indexOf("₹ ")));
  });

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
    let currentTot = 0,
      plTot = 0;
    keysH.forEach((scrip) => {
      let [qty, avg] = holding[scrip];
      currentTot += showEachHolding(scrip, qty, avg); //qty * 2000;
      //showEachHolding(scrip, qty, avg);
    });
    document.getElementById("holding_totCurrent").innerHTML =
      "Current ₹ " + currentTot;
    document.getElementById("holding_totpnl").innerHTML = currentTot - inv;
    let pnlpcnt = String(((currentTot - inv) / inv) * 100);
    document.getElementById("holding_totpnlprcnt").innerHTML =
      "(" + pnlpcnt.slice(0, pnlpcnt.indexOf(".") + 2);

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
<p id="holding_totCurrent">Current ₹ </p>
<p>
  P&L: <span id="holding_totpnl"></span>
  <span id="holding_totpnlprcnt"></span>%)
</p>
</div>`;
}
async function showEachHolding(scrip, qty, avg) {
  //fetch curr
  let ltp = Number((await fetchData(scrip)).ltp);
  let //ltp = 2000,
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
    <p>LTP <span class="pc">₹</span> ` +
    ltp +
    `</p>
    <p><span class="pc">₹</span> ` +
    pnl.toFixed(2) +
    ` (` +
    pnlpct +
    `%)</p>
  </div>
  <div class="holding-scrip-status">
    <p>Qty: ` +
    qty +
    `</p>
    <p>Avg: <span class="pc">₹</span> ` +
    avg.toFixed(2) +
    `</p>
    <p>Invested: <span class="pc">₹</span> ` +
    inv +
    `</p>
  </div>
</div>`;
  return ltp * qty;
}

function showEachOrder(name, type, qty, avg, time) {
  order_add_cards.innerHTML +=
    `<div class="holding-card ` +
    (type == "b" ? `green` : `red`) +
    `">
  <div class="holding-scrip">
    <p>` +
    (type == "b"
      ? `<span class="pc">BUY</span>
    <span class="mob">B</span>
    `
      : `<span class="pc">SELL</span>
    <span class="mob">S</span>`) +
    `</p>
    <p>` +
    name +
    `</p>
    <p><span class="pc">Qty</span> ` +
    qty +
    ` @ <span class="pc">₹</span> ` +
    avg +
    `</p>
    <p>` +
    time +
    `</p>
  </div>
</div>`;
}
