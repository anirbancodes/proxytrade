import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";
import {
  getFirestore,
  increment,
  getDoc,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";
import { getPrice } from "./old-getPrice.js";
import { fetchData } from "../fetchPrice.js";

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const user_email = document.getElementById("user_email");
const user_margin = document.getElementById("user_margin");
const holding_add_cards = document.getElementById("holding_add_cards");
const order_add_cards = document.getElementById("order_add_cards");

import { db, auth } from "../firebase.js";

let currentTot = 0;

let ordersList = []; // global
let currentOrderPage = 1;
const ordersPerPage = 5;

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

function showUserInfo(email, margin) {
  user_email.textContent = email;
  user_margin.textContent = `₹ ${margin.toFixed(2)}`;
}

export async function showHoldings(email) {
  const addFundsBtn = document.getElementById("addFunds");
  // addFundsBtn.addEventListener("click", async () => {
  //   await updateDoc(
  //     doc(db, "users", email),
  //     { margin: increment(10000) },
  //     { merge: true }
  //   );
  //   window.location = "/";
  // });

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

    // Update holding totals
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

  order_add_cards.innerHTML = "";

  ordersList = orders || [];
  const savedPage = parseInt(localStorage.getItem("orders_current_page")) || 1;
  currentOrderPage = Math.min(
    savedPage,
    Math.ceil(ordersList.length / ordersPerPage) || 1
  );
  renderOrdersPage(currentOrderPage);
}
function renderOrdersPage(page) {
  const start = (page - 1) * ordersPerPage;
  const end = start + ordersPerPage;
  const paginatedOrders = ordersList.slice(start, end);

  order_add_cards.innerHTML = "";

  paginatedOrders.forEach((order) => {
    const name = Object.keys(order)[0];
    const [type, qty, avg, time] = order[name];
    showEachOrder(name, type, qty, avg, time);
  });

  renderOrderPaginationControls(page);
}
function renderOrderPaginationControls(currentPage) {
  const totalPages = Math.ceil(ordersList.length / ordersPerPage);
  const controls = document.createElement("div");
  controls.className = "pagination-controls";

  // Save current page to localStorage
  localStorage.setItem("orders_current_page", currentPage);

  // First Button
  if (currentPage > 1) {
    const firstBtn = createPageButton("« First", () => renderOrdersPage(1));
    controls.appendChild(firstBtn);
  }

  // Prev Button
  if (currentPage > 1) {
    const prevBtn = createPageButton("← Prev", () =>
      renderOrdersPage(currentPage - 1)
    );
    controls.appendChild(prevBtn);
  }

  // Numbered buttons with ellipsis
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage < maxButtons - 1)
    startPage = Math.max(1, endPage - maxButtons + 1);

  if (startPage > 1) {
    controls.appendChild(createPageButton("1", () => renderOrdersPage(1)));
    if (startPage > 2) controls.appendChild(createEllipsis());
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = createPageButton(i, () => renderOrdersPage(i));
    if (i === currentPage) {
      pageBtn.disabled = true;
      pageBtn.style.backgroundColor = "#888";
    }
    controls.appendChild(pageBtn);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) controls.appendChild(createEllipsis());
    controls.appendChild(
      createPageButton(totalPages, () => renderOrdersPage(totalPages))
    );
  }

  // Next Button
  if (currentPage < totalPages) {
    const nextBtn = createPageButton("Next →", () =>
      renderOrdersPage(currentPage + 1)
    );
    controls.appendChild(nextBtn);
  }

  // Last Button
  if (currentPage < totalPages) {
    const lastBtn = createPageButton("Last »", () =>
      renderOrdersPage(totalPages)
    );
    controls.appendChild(lastBtn);
  }

  // "Go to Page #" input
  const jumpWrapper = document.createElement("div");
  jumpWrapper.style.marginLeft = "12px";
  jumpWrapper.style.display = "flex";
  jumpWrapper.style.alignItems = "center";
  jumpWrapper.style.gap = "6px";

  const jumpLabel = document.createElement("span");
  jumpLabel.textContent = "Go to:";
  jumpLabel.style.fontSize = "13px";
  jumpLabel.style.color = "#ccc";

  const jumpInput = document.createElement("input");
  jumpInput.type = "number";
  jumpInput.min = 1;
  jumpInput.max = totalPages;
  jumpInput.style.width = "50px";
  jumpInput.style.padding = "2px 4px";
  jumpInput.style.fontSize = "14px";
  jumpInput.style.borderRadius = "4px";
  jumpInput.style.border = "1px solid #666";
  jumpInput.value = currentPage;

  jumpInput.onchange = () => {
    const val = parseInt(jumpInput.value);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      renderOrdersPage(val);
    }
  };

  jumpWrapper.appendChild(jumpLabel);
  jumpWrapper.appendChild(jumpInput);
  controls.appendChild(jumpWrapper);

  order_add_cards.appendChild(controls);
}

function createPageButton(label, onClick) {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.onclick = onClick;
  return btn;
}

function createEllipsis() {
  const span = document.createElement("span");
  span.textContent = "...";
  span.style.padding = "0 6px";
  span.style.color = "#ccc";
  return span;
}

function holding_info(inv) {
  holding_add_cards.innerHTML = `
    <div class="holding-status">
      <p id="holding_totInvested">Invested ₹ ${inv}</p>
      <p id="holding_totCurrent">Current ₹ </p>
      <p>P&L: <span id="holding_totpnl"></span> <span id="holding_totpnlprcnt"></span></p>
    </div>`;
}

async function showEachHolding(scrip, qty, avg) {
  const ltp = Number((await fetchData(scrip)).ltp);
  const inv = qty * avg;
  const pnl = (ltp - avg) * qty;
  const pnlpct = ((pnl / inv) * 100).toFixed(2);
  const pnlClass = pnl >= 0 ? "green" : "red";

  holding_add_cards.innerHTML += `
    <div class="holding-card ${pnlClass}">
      <div class="holding-scrip">
        <p>${scrip}</p>
        <p>LTP <span class="pc">₹</span> ${ltp}</p>
        <p><span class="pc">₹</span> ${pnl.toFixed(2)} (${pnlpct}%)</p>
      </div>
      <div class="holding-scrip-status">
        <p>Qty: ${qty}</p>
        <p>Avg: <span class="pc">₹</span> ${avg.toFixed(2)}</p>
        <p>Invested: <span class="pc">₹</span> ${inv}</p>
      </div>
    </div>`;

  return ltp * qty;
}

function showEachOrder(name, type, qty, avg, time) {
  const typeLabel =
    type === "b"
      ? `<span class="pc">BUY</span><span class="mob">B</span>`
      : `<span class="pc">SELL</span><span class="mob">S</span>`;
  const orderClass = type === "b" ? "green" : "red";

  order_add_cards.innerHTML += `
    <div class="holding-card ${orderClass}">
      <div class="holding-scrip">
        <p>${typeLabel}</p>
        <p>${name}</p>
        <p><span class="pc">Qty</span> ${qty} @ <span class="pc">₹</span> ${avg}</p>
        <p>${time}</p>
      </div>
    </div>`;
}
