import { showHoldings } from "./old/signin.js";
import {
  getFirestore,
  collection,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  deleteDoc,
  deleteField,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";

import { db, auth } from "./firebase.js";

let place_buy = document.getElementById("place_buy");
let place_sell = document.getElementById("place_sell");

place_buy.addEventListener("click", async (e) => {
  const user = auth.currentUser;

  let place_order_scrip = document.getElementById("place_order_scrip").value;
  let place_order_qty = parseInt(
    document.getElementById("place_order_qty").value
  );
  let place_order_price = parseFloat(
    document.getElementById("place_order_price").innerText
  );
  let order_valid = checkOrderValid(
    place_order_scrip,
    place_order_qty,
    place_order_price
  );
  if (order_valid == true) {
    let time = giveTime();
    const ref = doc(db, "users", user.email);
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      let data = docSnap.data();
      let inv = data.inv;
      let margin = data.margin;
      let holding = data.holding;
      if (holding[place_order_scrip] == undefined) {
        let newData = [place_order_qty, place_order_price];
        await updateDoc(
          ref,
          {
            [`holding.${place_order_scrip}`]: newData,
            margin: margin - place_order_price * place_order_qty,
            inv: inv + place_order_price * place_order_qty,
          },
          { merge: true }
        );
      } else if (holding[place_order_scrip][0] > 0) {
        let [scrip_qty, scrip_avg] = holding[place_order_scrip];
        scrip_qty = parseInt(scrip_qty);
        scrip_avg = parseFloat(scrip_avg);
        let newAvg =
          (scrip_qty * scrip_avg + place_order_qty * place_order_price) /
          (scrip_qty + place_order_qty);
        let newData = [scrip_qty + place_order_qty, newAvg];

        await updateDoc(
          ref,
          {
            [`holding.${place_order_scrip}`]: newData,
            margin: margin - place_order_price * place_order_qty,
            inv: inv + place_order_price * place_order_qty,
          },
          { merge: true }
        );
      }
      await updateDoc(ref, {
        orders: arrayUnion({
          [place_order_scrip]: ["b", place_order_qty, place_order_price, time],
        }),
      });
      showHoldings(user.email);
    }
  } else {
    alert("Sign in");
  }
});

place_sell.addEventListener("click", async (e) => {
  const user = auth.currentUser;

  let place_order_scrip = document.getElementById("place_order_scrip").value;
  let place_order_qty = parseInt(
    document.getElementById("place_order_qty").value
  );
  let place_order_price = parseFloat(
    document.getElementById("place_order_price").innerText
  );
  let order_valid = checkOrderValid(
    place_order_scrip,
    place_order_qty,
    place_order_price
  );
  if (order_valid == true) {
    let time = giveTime();
    const ref = doc(db, "users", user.email);
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      let data = docSnap.data();
      let inv = data.inv;
      let margin = data.margin;
      let holding = data.holding;
      if (holding[place_order_scrip] == undefined) {
        alert("Not present in holding..");
      } else if (holding[place_order_scrip][0] > 0) {
        let [scrip_qty, scrip_avg] = holding[place_order_scrip];
        scrip_qty = parseInt(scrip_qty);
        scrip_avg = parseFloat(scrip_avg);
        if (place_order_qty > scrip_qty) {
          alert("Insufficient Holding Qty");
        } else if (place_order_qty < scrip_qty) {
          let newData = [scrip_qty - place_order_qty, scrip_avg];
          await updateDoc(
            ref,
            {
              [`holding.${place_order_scrip}`]: newData,
              margin: margin + place_order_price * place_order_qty,
              inv: inv - scrip_avg * place_order_qty,
            },
            { merge: true }
          );
          await updateDoc(ref, {
            orders: arrayUnion({
              [place_order_scrip]: [
                "s",
                place_order_qty,
                place_order_price,
                time,
              ],
            }),
          });
          showHoldings(user.email);
        } else if (place_order_qty == scrip_qty) {
          await updateDoc(
            ref,
            {
              [`holding.${place_order_scrip}`]: deleteField(),
              margin: margin + place_order_price * place_order_qty,
              inv: inv - scrip_avg * place_order_qty,
            },
            { merge: true }
          );
          await updateDoc(ref, {
            orders: arrayUnion({
              [place_order_scrip]: [
                "s",
                place_order_qty,
                place_order_price,
                time,
              ],
            }),
          });
          showHoldings(user.email);
        }
      }
    }
  } else {
    alert("Sign in");
  }
});

function checkOrderValid(scrip, qty, price) {
  if (scrip == null) {
    alert("Select any stock");
    return false;
  }
  if (qty <= 0 || qty == null) {
    alert("Enter valid qty");
    return false;
  }
  if (price <= 0 || price == null) {
    alert("Enter valid price");
    return false;
  }
  return true;
}

function giveTime() {
  let current = new Date();
  let cDate =
    current.getDate() +
    "-" +
    (current.getMonth() + 1) +
    "-" +
    current.getFullYear();
  let cTime =
    current.getHours() +
    ":" +
    current.getMinutes() +
    ":" +
    current.getSeconds();
  let dateTime = cDate + " " + cTime;
  return dateTime;
}

/* // For sell
// if holding
if (scrip_qty > 0) {
  if (qty > scrip_qty) {
    alert("Insufficient stocks in holding");
    return false;
  } else {
    let pnl = (avg - scrip_avg) * qty;
    margin += pnl;
    let newData = [scrip_qty - qty, scrip_avg];
  }
} else {
  alert("Cannot sell which you don't own.");
} */

/*
function updateHolding() {
  const orderRef = doc(db, "proxytrade", user.email);

  // To update age and favorite color:
   await updateDoc(orderRef, {
      "orders.name": scrip,
      "orders.avg": avg,
      "orders.qty": qty,
    }); 
  class Order {
    constructor(avg, qty, time, type) {
      this.qty = qty;
      this.time = time;
      this.avg = avg;
      this.type = type;
    }
    toString() {
      return this.avg + ", " + this.qty + ", " + this.time + ", " + this.type;
    }
  }

  // Firestore data converter
  const orderConverter = {
    toFirestore: (order) => {
      return {
        //   name: order.name,
        qty: order.qty,
        avg: order.avg,
        price: order.price,
        time: order.time,
      };
    },
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      return new Order(data.avg, data.qty, data.time, data.type);
    },
  };

  // Set with orderConverter
  const ref = doc(db, "proxytrade", orders).withConverter(orderConverter);
  // await setDoc(ref, new Order(avg, qty, time, type));
}
*/
