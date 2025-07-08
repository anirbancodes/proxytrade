import { updateHoldingsView } from "./holdings.js";
import { setupOrders } from "./orders.js";
import { db, doc, getDoc } from "./firebase.js";

export async function refreshUI(email) {
  const ref = doc(db, "users", email);
  const docSnap = await getDoc(ref);
  if (!docSnap.exists()) return;

  await updateHoldingsView(email);
  setupOrders(docSnap.data().orders || []);
}
