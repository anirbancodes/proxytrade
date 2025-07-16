/*  write a c program and print out the number which is divisble by 5 when user enter the starting and ending number and count it using loops.
 */

import { fetchIdx } from "./fetchPrice";

// alert("ji");
let nseIdxData = await fetchIdx("nse");
let nseIdxKeys = Object.keys(nseIdxData);
let tickerNseIdxDiv = document.getElementById("ticker-nseIdx");
tickerNseIdxDiv.innerHTML = "";

for (let i of nseIdxKeys) {
  tickerNseIdxDiv.innerHTML +=
    `<p id="">
            ` +
      i +
      ` <span style="color: ` +
      nseIdxData[i].pchP >=
    0
      ? "green"
      : "red" +
        `">` +
        nseIdxData[i].ltp +
        ` &uparrow;` +
        nseIdxData[i].pchP +
        `%</span>
          </p>`;
}
