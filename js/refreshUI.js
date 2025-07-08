import { showHoldings } from "./holdings.js";
import { auth } from "./firebase.js";

import { renderOrdersPage } from "./orders.js";

export async function refreshUIAfterOrder() {
  const user = auth.currentUser;
  if (!user) return;

  await showHoldings(user.email, true); // true → reuse LTP cache
  renderOrdersPage(1);
}
