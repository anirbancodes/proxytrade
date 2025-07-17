import { fetchIdx, fetchCurrency } from "./fetchPrice.js";

let tempArr = [
  { div: "ticker-nseIdx", func: fetchIdx("nse") },
  { div: "ticker-globalIdx", func: fetchIdx() },
  { div: "ticker-currency", func: fetchCurrency() },
];

for (let item of tempArr) {
  loadData(item.div, item.func);
}

async function loadData(divId, func) {
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
}
/*
async function loadNseIdx() {
  let nseIdxData = await fetchIdx("nse");
  let nseIdxKeys = Object.keys(nseIdxData);
  //   let tickerNseIdxDiv = document.getElementById("ticker-nseIdx");
  //   tickerNseIdxDiv.innerHTML = "";

  const ticker = document.getElementById("ticker-nseIdx");
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


 document.getElementById("indexTickers").style.display = "";
  document.getElementById("ticker-nseIdx").style.display = "";
}
async function loadCurrency() {
  let nseIdxData = await fetchCurrency();
  let nseIdxKeys = Object.keys(nseIdxData);
  //   let tickerNseIdxDiv = document.getElementById("ticker-currency");
  //   tickerNseIdxDiv.innerHTML = "";

  const ticker = document.getElementById("ticker-currency");
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
  document.getElementById("ticker-currency").style.display = "";
}
async function loadGlobalIdx() {
  let nseIdxData = await fetchIdx();
  let nseIdxKeys = Object.keys(nseIdxData);

  const ticker = document.getElementById("ticker-globalIdx");
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

  document.getElementById("ticker-globalIdx").style.display = "";
}
*/
// loadNseIdx();
// loadCurrency();
// loadGlobalIdx();

/*  for (let i of nseIdxKeys) {
      let color = nseIdxData[i].pchP >= 0 ? "green" : "red";
      let arrow = nseIdxData[i].pchP >= 0 ? "&uparrow;" : "&downarrow;";
      tickerNseIdxDiv.innerHTML += `<p>
             ${i.toUpperCase()} <span style="color: ${color}">
            ${nseIdxData[i].ltp}
             ${arrow}
            ${nseIdxData[i].pchP}
            %</span>
            </p>`;
    } */
