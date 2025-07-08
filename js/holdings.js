import { fetchData } from "./fetchPrice.js";
import { db, doc, getDoc } from "./firebase.js";
import { showUserInfo } from "./ui.js";
import { setupOrders } from "./orders.js";

const holding_add_cards = document.getElementById("holding_add_cards");

let ltpCache = {};
let holdingList = [];
let currentTotalInvested = 0;

export async function showHoldings(email, reuseCache = false) {
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

  let staticHTML = "";
  const updatedHoldingList = [];

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

    updatedHoldingList.push({ scrip, qty, avg });
  });

  holding_add_cards.innerHTML += staticHTML;
  holdingList = updatedHoldingList;

  await updateLTPsForHoldings(reuseCache);
  setupOrders(orders);
}

function holding_info(inv) {
  holding_add_cards.innerHTML = `
    <div class="holding-status">
      <p id="holding_totInvested">Invested ₹ ${inv.toFixed(2)}</p>
      <p id="holding_totCurrent">Current ₹ </p>
      <p>P&L: <span id="holding_totpnl"></span> <span id="holding_totpnlprcnt"></span></p>
    </div>`;
}

async function updateLTPsForHoldings(reuseCache = false) {
  let totalCurrent = 0;

  for (const { scrip, qty, avg } of holdingList) {
    let ltp = ltpCache[scrip];
    if (!ltp || !reuseCache) {
      try {
        ltp = Number((await fetchData(scrip)).ltp);
        ltpCache[scrip] = ltp;
      } catch (err) {
        console.error(`Error fetching LTP for ${scrip}:`, err);
        continue;
      }
    }

    const inv = qty * avg;
    const pnl = (ltp - avg) * qty;
    const pnlPct = inv !== 0 ? ((pnl / inv) * 100).toFixed(2) : "0.00";
    totalCurrent += ltp * qty;

    const card = document.getElementById(`holding-${scrip}`);
    if (!card) continue;

    card.classList.add(pnl >= 0 ? "green" : "red");
    card.querySelector(".ltp-value").textContent = ltp.toFixed(2);
    card.querySelector(".pnl-value").textContent = pnl.toFixed(2);
    card.querySelector(".pnl-pct").textContent = pnlPct;
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

export function updateHoldingsUsingCache() {
  holding_add_cards.innerHTML = ""; // Clear previous cards
  holding_info(currentTotalInvested); // Reuse invested value

  let totalCurrent = 0;

  holdingList.forEach(({ scrip, qty, avg }) => {
    const ltp = ltpCache[scrip];
    console.log(ltp);
    if (!ltp) return;

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
  });

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

export function addToHoldingList(scrip, qtyDelta, price) {
  const existing = holdingList.find((h) => h.scrip === scrip);

  if (existing) {
    const totalQty = existing.qty + qtyDelta;

    if (totalQty <= 0) {
      // Remove from list if all sold
      holdingList = holdingList.filter((h) => h.scrip !== scrip);
      delete ltpCache[scrip];
    } else {
      existing.avg =
        (existing.qty * existing.avg + qtyDelta * price) / totalQty;
      existing.qty = totalQty;
    }
  } else if (qtyDelta > 0) {
    holdingList.push({ scrip, qty: qtyDelta, avg: price });
  }

  // Update invested total
  currentTotalInvested = holdingList.reduce(
    (sum, { qty, avg }) => sum + qty * avg,
    0
  );
}
