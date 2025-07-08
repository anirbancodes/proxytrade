import {
  getFirestore,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  deleteField,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";

import { db, auth } from "./firebase.js";
import { showHoldings } from "./holdings.js";

const place_buy = document.getElementById("place_buy");
const place_sell = document.getElementById("place_sell");

place_buy.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Sign in");

  const scrip = document.getElementById("place_order_scrip").value;
  const qty = parseInt(document.getElementById("place_order_qty").value);
  const price = parseFloat(
    document.getElementById("place_order_price").innerText
  );
  console.log(`"${scrip}"`, qty, price);

  if (!checkOrderValid(scrip, qty, price)) return;

  const ref = doc(db, "users", user.email);
  const docSnap = await getDoc(ref);
  if (!docSnap.exists()) return alert("User not found");

  const { inv, margin, holding = {} } = docSnap.data();
  const time = getFormattedTime();
  const investment = price * qty;

  const newHolding = holding[scrip] ? [...holding[scrip]] : [0, 0];
  const [oldQty, oldAvg] = newHolding;
  const newQty = oldQty + qty;
  const newAvg = (oldQty * oldAvg + qty * price) / newQty;

  await updateDoc(ref, {
    [`holding.${scrip}`]: [newQty, newAvg],
    margin: margin - investment,
    inv: inv + investment,
    orders: arrayUnion({ [scrip]: ["b", qty, price, time] }),
  });

  showHoldings(user.email);
});

place_sell.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Sign in");

  const scrip = document.getElementById("place_order_scrip").value;
  const qty = parseInt(document.getElementById("place_order_qty").value);
  const price = parseFloat(
    document.getElementById("place_order_price").innerText
  );

  if (!checkOrderValid(scrip, qty, price)) return;

  const ref = doc(db, "users", user.email);
  const docSnap = await getDoc(ref);
  if (!docSnap.exists()) return alert("User not found");

  const { inv, margin, holding = {} } = docSnap.data();
  const current = holding[scrip];
  if (!current || current[0] <= 0) return alert("Not present in holding");

  const time = getFormattedTime();
  const [oldQty, avg] = current;

  if (qty > oldQty) return alert("Insufficient Holding Qty");

  const newQty = oldQty - qty;
  const pnl = (price - avg) * qty;

  const updates = {
    margin: margin + price * qty,
    inv: inv - avg * qty,
    orders: arrayUnion({ [scrip]: ["s", qty, price, time] }),
  };

  if (newQty === 0) updates[`holding.${scrip}`] = deleteField();
  else updates[`holding.${scrip}`] = [newQty, avg];

  await updateDoc(ref, updates);
  showHoldings(user.email);
});

function checkOrderValid(scrip, qty, price) {
  if (!scrip) return alert("Select any stock"), false;
  if (!qty || qty <= 0) return alert("Enter valid qty"), false;
  if (!price || price <= 0) return alert("Enter valid price"), false;
  return true;
}

function getFormattedTime() {
  const now = new Date();
  const date = now.toLocaleDateString("en-IN").replaceAll("/", "-");
  const time = now.toLocaleTimeString("en-IN");
  return `${date} ${time}`;
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
