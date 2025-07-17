import { fetchIdx, fetchCurrency } from "./fetchPrice.js";

let tempArr = [
  { div: "ticker-nseIdx", func: fetchIdx("nse") },
  { div: "ticker-globalIdx", func: fetchIdx() },
  { div: "ticker-currency", func: fetchCurrency() },
];

const uiStart = () => {
  for (let item of tempArr) {
    showPrices(item.div, item.func);
  }
};
uiStart();
let refreshBtn = document.getElementById("refreshTickers");
refreshBtn.addEventListener("click", (e) => {
  e.preventDefault();
  uiStart();
});

async function showPrices(divId, func) {
  let nseIdxData = await func;
  let nseIdxKeys = Object.keys(nseIdxData);

  const ticker = document.getElementById(divId);
  function generateTickerText(data) {
    return data
      .map((i) => {
        let color = nseIdxData[i].pchP >= 0 ? "green" : "red";
        let arrow = nseIdxData[i].pchP >= 0 ? "&uparrow;" : "&downarrow;";

        return `${i.toUpperCase()} <span style="color:${color}" >${
          nseIdxData[i].ltp
        } ${arrow} ${nseIdxData[i].pchP}%</span> `;
      })
      .join(`    `);
  }
  ticker.innerHTML =
    generateTickerText(nseIdxKeys) + `    ` + generateTickerText(nseIdxKeys);

  document.getElementById(divId).style.display = "";
  document.getElementById("indexTickers").style.display = "";
}
