import { fetchData } from "./fetchPrice.js";
import { db, doc, getDoc } from "./firebase.js";
import { showUserInfo } from "./ui.js";
import { setupOrders } from "./orders.js";

const holding_add_cards = document.getElementById("holding_add_cards");
let ltpCache = {};
let holdingList = [],
  currentTotalInvested = 0;

export async function showHoldings(email) {
  const ref = doc(db, "users", email);
  const docSnap = await getDoc(ref);

  if (!docSnap.exists()) {
    alert("Please signup !");
    return;
  }

  const { inv, margin, holding = {}, orders = [] } = docSnap.data();

  showUserInfo(email, margin);
  holding_info(inv);

  const keysH = Object.keys(holding).sort();

  currentTotalInvested = inv;
  holdingList = [];
  let staticHTML = "";

  keysH.forEach((scrip) => {
    const [qty, avg] = holding[scrip];
    const inv = qty * avg;

    const ltp = ltpCache[scrip];

    staticHTML += `
    <div class="holding-card" id="holding-${scrip}">
      <div class="holding-scrip">
        <p>${scrip}</p>
        <p>LTP <span class="pc">₹</span> <span class="ltp-value">--</span></p>
        <p><span class="pc">₹</span> <span class="pnl-value">--</span> (<span class="pnl-pct">--</span>%)</p>
      </div>
      <div class="holding-scrip-status">
        <p>Qty: ${qty}</p>
        <p>Avg: <span class="pc">₹</span> ${avg.toFixed(2)}</p>
        <p>Invested: <span class="pc">₹</span> ${inv.toFixed(2)}</p>
      </div>
    </div>`;

    holdingList.push({ scrip, qty, avg });
  });

  holding_add_cards.innerHTML += staticHTML;
  updateLTPsForHoldings(holdingList, inv);
  setupOrders(orders);
}

function holding_info(inv) {
  holding_add_cards.innerHTML = `
    <div class="holding-status">
      <p id="holding_totInvested">Invested ₹ ${inv}</p>
      <p id="holding_totCurrent">Current ₹ </p>
      <p>P&L: <span id="holding_totpnl"></span> <span id="holding_totpnlprcnt"></span></p>
    </div>`;
}

export async function updateHoldingsView(email) {
  const ref = doc(db, "users", email);
  const docSnap = await getDoc(ref);

  if (!docSnap.exists()) return;

  const { inv, margin, holding = {} } = docSnap.data();

  showUserInfo(email, margin);
  holding_info(inv);

  const keysH = Object.keys(holding).sort();
  let staticHTML = "";

  keysH.forEach((scrip) => {
    const [qty, avg] = holding[scrip];
    const inv = qty * avg;

    staticHTML += `
    <div class="holding-card" id="holding-${scrip}">
      <div class="holding-scrip">
        <p>${scrip}</p>
        <p>LTP <span class="pc">₹</span> <span class="ltp-value">--</span></p>
        <p><span class="pc">₹</span> <span class="pnl-value">--</span> (<span class="pnl-pct">--</span>%)</p>
      </div>
      <div class="holding-scrip-status">
        <p>Qty: ${qty}</p>
        <p>Avg: <span class="pc">₹</span> ${avg.toFixed(2)}</p>
        <p>Invested: <span class="pc">₹</span> ${inv.toFixed(2)}</p>
      </div>
    </div>`;
  });

  holding_add_cards.innerHTML = staticHTML;
}

async function updateLTPsForHoldings(holdingList, totalInvested) {
  let totalCurrent = 0;

  for (const { scrip, qty, avg } of holdingList) {
    let ltp = ltpCache[scrip];
    if (!ltp) {
      try {
        ltp = Number((await fetchData(scrip)).ltp);
        ltpCache[scrip] = ltp;
      } catch (err) {
        console.error(`Error fetching LTP for ${scrip}:`, err);
        continue;
      }
    }

    try {
      // const ltp = Number((await fetchData(scrip)).ltp);
      const inv = qty * avg;
      const pnl = (ltp - avg) * qty;
      const pnlPct = inv !== 0 ? ((pnl / inv) * 100).toFixed(2) : "0.00";
      totalCurrent += ltp * qty;

      const card = document.getElementById(`holding-${scrip}`);
      card.classList.add(pnl >= 0 ? "green" : "red");
      card.querySelector(".ltp-value").textContent = ltp.toFixed(2);
      card.querySelector(".pnl-value").textContent = pnl.toFixed(2);
      card.querySelector(".pnl-pct").textContent = pnlPct;
    } catch (err) {
      console.error(`Error fetching LTP for ${scrip}:`, err);
    }
  }

  document.getElementById("holding_totCurrent").textContent =
    "Current ₹ " + totalCurrent.toFixed(2);
  document.getElementById("holding_totpnl").textContent = (
    totalCurrent - totalInvested
  ).toFixed(2);
  const pnlPercent = totalInvested
    ? (((totalCurrent - totalInvested) / totalInvested) * 100).toFixed(2)
    : "0.00";
  document.getElementById("holding_totpnlprcnt").textContent =
    "(" + pnlPercent + "%)";
}

export function updateHoldingsUsingCache() {
  holding_add_cards.innerHTML = ""; // clear previous
  holding_info(currentTotalInvested); // reuse previous investment value

  let totalCurrent = 0;

  for (const { scrip, qty, avg } of holdingList) {
    const ltp = ltpCache[scrip];
    if (!ltp) continue;

    const inv = qty * avg;
    const pnl = (ltp - avg) * qty;
    const pnlPct = inv !== 0 ? ((pnl / inv) * 100).toFixed(2) : "0.00";
    totalCurrent += ltp * qty;

    const cardHTML = `
      <div class="holding-card ${
        pnl >= 0 ? "green" : "red"
      }" id="holding-${scrip}">
        <div class="holding-scrip">
          <p>${scrip}</p>
          <p>LTP <span class="pc">₹</span> <span class="ltp-value">${ltp.toFixed(
            2
          )}</span></p>
          <p><span class="pc">₹</span> <span class="pnl-value">${pnl.toFixed(
            2
          )}</span> (<span class="pnl-pct">${pnlPct}</span>%)</p>
        </div>
        <div class="holding-scrip-status">
          <p>Qty: ${qty}</p>
          <p>Avg: <span class="pc">₹</span> ${avg.toFixed(2)}</p>
          <p>Invested: <span class="pc">₹</span> ${inv.toFixed(2)}</p>
        </div>
      </div>
    `;

    holding_add_cards.innerHTML += cardHTML;
  }

  document.getElementById("holding_totCurrent").textContent =
    "Current ₹ " + totalCurrent.toFixed(2);

  const pnl = totalCurrent - currentTotalInvested;
  const pnlPercent = currentTotalInvested
    ? ((pnl / currentTotalInvested) * 100).toFixed(2)
    : "0.00";

  document.getElementById("holding_totpnl").textContent = pnl.toFixed(2);
  document.getElementById(
    "holding_totpnlprcnt"
  ).textContent = `(${pnlPercent}%)`;
}

/*import { fetchData } from "./fetchPrice.js";
import {
  doc,
  getDoc,
  increment,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";
import { db } from "./firebase.js";
import { showUserInfo } from "./ui.js";
import { renderOrdersPage } from "./orders.js";

const holding_add_cards = document.getElementById("holding_add_cards");
const order_add_cards = document.getElementById("order_add_cards");
const ordersPerPage = 5;

let ordersList = [];
let currentOrderPage = 1;

export async function showHoldings(email) {
  const ref = doc(db, "users", email);
  const docSnap = await getDoc(ref);

  // addFundsBtn.addEventListener("click", async () => {
  //   await updateDoc(
  //     doc(db, "users", email),
  //     { margin: increment(10000) },
  //     { merge: true }
  //   );
  //   window.location = "/";
  // });

  if (!docSnap.exists()) {
    alert("Please signup !");
    return;
  }

  const { inv, margin, holding = {}, orders = [] } = docSnap.data();

  showUserInfo(email, margin);
  holding_info(inv);

  const keysH = Object.keys(holding).sort();
  const holdingList = [];
  let staticHTML = "";

  keysH.forEach((scrip) => {
    const [qty, avg] = holding[scrip];
    const inv = qty * avg;

    staticHTML += `
    <div class="holding-card" id="holding-${scrip}">
      <div class="holding-scrip">
        <p>${scrip}</p>
        <p>LTP <span class="pc">₹</span> <span class="ltp-value">--</span></p>
        <p><span class="pc">₹</span> <span class="pnl-value">--</span> (<span class="pnl-pct">--</span>%)</p>
      </div>
      <div class="holding-scrip-status">
        <p>Qty: ${qty}</p>
        <p>Avg: <span class="pc">₹</span> ${avg.toFixed(2)}</p>
        <p>Invested: <span class="pc">₹</span> ${inv.toFixed(2)}</p>
      </div>
    </div>`;

    holdingList.push({ scrip, qty, avg });
  });

  holding_add_cards.innerHTML += staticHTML;
  updateLTPsForHoldings(holdingList, inv);

  // Render orders
  order_add_cards.innerHTML = "";
  ordersList = orders.sort() || [];
  const savedPage = parseInt(localStorage.getItem("orders_current_page")) || 1;
  currentOrderPage = Math.min(
    savedPage,
    Math.ceil(ordersList.length / ordersPerPage) || 1
  );
  renderOrdersPage(currentOrderPage, ordersList);
}

function holding_info(inv) {
  holding_add_cards.innerHTML = `
    <div class="holding-status">
      <p id="holding_totInvested">Invested ₹ ${inv}</p>
      <p id="holding_totCurrent">Current ₹ </p>
      <p>P&L: <span id="holding_totpnl"></span> <span id="holding_totpnlprcnt"></span></p>
    </div>`;
}

async function updateLTPsForHoldings(holdingList, totalInvested) {
  let totalCurrent = 0;

  for (const { scrip, qty, avg } of holdingList) {
    try {
      const ltp = Number((await fetchData(scrip)).ltp);
      const inv = qty * avg;
      const pnl = (ltp - avg) * qty;
      const pnlPct = inv !== 0 ? ((pnl / inv) * 100).toFixed(2) : "0.00";
      totalCurrent += ltp * qty;

      const card = document.getElementById(`holding-${scrip}`);
      card.classList.add(pnl >= 0 ? "green" : "red");
      card.querySelector(".ltp-value").textContent = ltp.toFixed(2);
      card.querySelector(".pnl-value").textContent = pnl.toFixed(2);
      card.querySelector(".pnl-pct").textContent = pnlPct;
    } catch (err) {
      console.error(`Error fetching LTP for ${scrip}:`, err);
    }
  }

  document.getElementById("holding_totCurrent").textContent =
    "Current ₹ " + totalCurrent.toFixed(2);
  document.getElementById("holding_totpnl").textContent = (
    totalCurrent - totalInvested
  ).toFixed(2);
  const pnlPercent = totalInvested
    ? (((totalCurrent - totalInvested) / totalInvested) * 100).toFixed(2)
    : "0.00";
  document.getElementById("holding_totpnlprcnt").textContent =
    "(" + pnlPercent + "%)";
}
*/
