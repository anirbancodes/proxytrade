export async function fetchData(scrip) {
  let apiData;

  try {
    const res1 = await fetch("https://stock.api.anirban.pro/" + scrip);
    const data1 = await res1.json();
    data1.ltp = data1.ltp.replaceAll(",", "");
    apiData = data1;
  } catch (err1) {
    try {
      const res2 = await fetch("https://stock.api.stoxic.one/" + scrip);
      const data2 = await res2.json();
      data2.ltp = data2.ltp.replaceAll(",", "");
      apiData = data2;
    } catch (err2) {
      apiData = {
        ltp: 0,
        dH: 0,
        dL: 0,
        name: "Could not load",
        yL: 0,
        yH: 0,
        pC: 0,
      };
    }
  }

  return apiData;
}

export async function fetchIdx(region) {
  let apiData;
  let url1 = "https://stock.api.anirban.pro/GFinIdx";
  let url2 = "https://stock.api.stoxic.one/GFinIdx";
  if (region == "nse") {
    url1 += "?c=nse";
    url2 += "?c=nse";
  }
  try {
    const res1 = await fetch(url1);
    const data1 = await res1.json();
    apiData = data1;
  } catch (err1) {
    try {
      const res2 = await fetch(url2);
      const data2 = await res2.json();
      apiData = data2;
    } catch (err2) {
      apiData = {
        nifty: {
          ltp: 0,
          pchP: 0,
        },
        niftybank: {
          ltp: 0,
          pchP: -0,
        },
        finnifty: {
          ltp: 0,
          pchP: 0,
        },
      };
    }
  }
  return apiData;
}
export async function fetchCurrency() {
  let apiData;
  let url1 = "https://stock.api.anirban.pro/currency";
  let url2 = "https://stock.api.stoxic.one/currency";

  try {
    const res1 = await fetch(url1);
    const data1 = await res1.json();
    apiData = data1;
  } catch (err1) {
    try {
      const res2 = await fetch(url2);
      const data2 = await res2.json();
      apiData = data2;
    } catch (err2) {
      // alert(err2);

      apiData = {
        "USD-INR": {
          ltp: 0,
          pchP: 0,
        },
        "EUR-INR": {
          ltp: 0,
          pchP: -0,
        },
        "CNY-INR": {
          ltp: 0,
          pchP: 0,
        },
        "JPY-INR": {
          ltp: 0,
          pchP: 0,
        },
      };
    }
  }
  return apiData;
}

/*Hi*/

let symbols = [...document.getElementsByClassName("dropdown-item")];
symbols.forEach((sym) => {
  sym.addEventListener("click", async (e) => {
    // let closeP = await fetchPrice(sym.innerHTML);
    // const scripRef = doc(db, "eod", sym.innerHTML);
    let scripData = await fetchData(sym.innerHTML); //getDoc(scripRef);
    console.log(scripData);
    let data;
    // if (scripData.exists() && scripData.data().data != null)
    data = scripData; //.data().data;
    console.log(data);
    document.getElementById("xx2").innerHTML =
      `

      <div id="fc">
      <p style="margin-bottom: 5px" id="scrip_name">` +
      data.name +
      `</p>
      <div
        class="details_iex"
        style="display: flex; justify-content: space-between"
      >
        <p id="52H">` +
      "52W High: " +
      data.yH +
      `</p>
        <p id="52L">` +
      "52W Low: " +
      data.yL +
      `</p>
      </div>
        <p id="MCap">` +
      "MCap: " +
      data.mC +
      `</p>
        <div
        class="details_iex"
        style="display: flex; justify-content: space-between"
      >
      <p id="dH">` +
      "Day High: " +
      data.dH +
      `</p>
      &emsp;  &emsp;
        <p id="Face_Value">` +
      "Day Low: " +
      data.dL +
      `</p>
        </div>
    </div>`;

    document.getElementById("xx2").innerHTML += `
      <div class="fr">
      <span class="pc">Qty:</span>

      <input
        id="place_order_qty"
        class="place-order-qty"
        placeholder="0"
        type="number"
      />
    
      <span id="xxx"></span>`;
    document.getElementById("xxx").innerHTML =
      `
      
      &nbsp; <span>NSE:</span>&nbsp;
            <!-- <input
              id="place_order_price"
              class="place-order-price"
              placeholder="0"
              type="number"
            /> -->
            <span
              style="
                padding: 10px 20px;
                background-color: white;
                border-radius: 50px;
                color: rgb(225, 169, 64);
              "
              id="place_order_price"
            >` +
      data.ltp +
      `</span>
            </div>`;
    document.getElementById("place_order_price").innerText = data.ltp;
    if (data) {
      //   document.getElementById("scrip_name").innerText = `NSE: ` + data.name;
      // document.getElementById("ISIN").innerText = `ISIN: ` + data.ISIN;
      // document.getElementById("Listing_Date").innerText =
      //   `Listing Date: ` + data.list_date;
      // document.getElementById("Face_Value").innerText =
      //   `Face Value: ` + data.fv;
    }
  });
});
