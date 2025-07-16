/*  write a c program and print out the number which is divisble by 5 when user enter the starting and ending number and count it using loops.
 */

import { fetchIdx, fetchCurrency } from "./fetchPrice.js";

// alert("ji");
async function loadNseIdx() {
  let nseIdxData = await fetchIdx("nse");
  let nseIdxKeys = Object.keys(nseIdxData);
  let tickerNseIdxDiv = document.getElementById("ticker-nseIdx");
  tickerNseIdxDiv.innerHTML = "";

  for (let i of nseIdxKeys) {
    let color = nseIdxData[i].pchP >= 0 ? "green" : "red";
    let arrow = nseIdxData[i].pchP >= 0 ? "&uparrow;" : "&downarrow;";
    tickerNseIdxDiv.innerHTML += `<p>
           ${i} <span style="color: ${color}">
          ${nseIdxData[i].ltp}
           ${arrow}
          ${nseIdxData[i].pchP}
          %</span>
          </p>`;
  }
  document.getElementById("indexTickers").style.display = "";
}
async function loadCurrency() {
  let nseIdxData = await fetchCurrency();
  let nseIdxKeys = Object.keys(nseIdxData);
  let tickerNseIdxDiv = document.getElementById("ticker-currency");
  tickerNseIdxDiv.innerHTML = "";

  for (let i of nseIdxKeys) {
    let color = nseIdxData[i].pchP >= 0 ? "green" : "red";
    let arrow = nseIdxData[i].pchP >= 0 ? "&uparrow;" : "&downarrow;";
    tickerNseIdxDiv.innerHTML += `<p>
           ${i} <span style="color: ${color}">
          ${nseIdxData[i].ltp}
           ${arrow}
          ${nseIdxData[i].pchP}
          %</span>
          </p>`;
  }
}
loadNseIdx();
loadCurrency();
