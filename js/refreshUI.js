import { updateHoldingsUsingCache } from "./holdings.js";
import { renderOrdersPage } from "./orders.js";

export function refreshUIAfterOrder() {
  updateHoldingsUsingCache();
  renderOrdersPage(1);
}
