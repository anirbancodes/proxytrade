// orders.js
import { order_add_cards } from "./ui.js";

let ordersList = [];
let currentOrderPage = 1;
const ordersPerPage = 5;

export function setupOrders(orders = []) {
  ordersList = [...orders].sort((a, b) => {
    const keyA = Object.keys(a)[0];
    const keyB = Object.keys(b)[0];
    const timeA = a[keyA][3];
    const timeB = b[keyB][3];
    return parseTimeDesc(timeB) - parseTimeDesc(timeA); // Sort DESC
  });

  currentOrderPage = 1;
  renderOrdersPage(currentOrderPage);
}

export function renderOrdersPage(page) {
  const start = (page - 1) * ordersPerPage;
  const end = start + ordersPerPage;
  const paginatedOrders = ordersList.slice(start, end);

  order_add_cards.innerHTML = "";
  paginatedOrders.forEach((order) => {
    const name = Object.keys(order)[0];
    const [type, qty, avg, time] = order[name];
    showEachOrder(name, type, qty, avg, time);
  });

  renderOrderPaginationControls(page);
}

function renderOrderPaginationControls(currentPage) {
  const totalPages = Math.ceil(ordersList.length / ordersPerPage);
  const controls = document.createElement("div");
  controls.className = "pagination-controls";

  localStorage.setItem("orders_current_page", currentPage);

  if (currentPage > 1) {
    controls.appendChild(
      createPageButton("« First", () => renderOrdersPage(1))
    );
    controls.appendChild(
      createPageButton("← Prev", () => renderOrdersPage(currentPage - 1))
    );
  }

  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage < maxButtons - 1)
    startPage = Math.max(1, endPage - maxButtons + 1);

  if (startPage > 1) {
    controls.appendChild(createPageButton("1", () => renderOrdersPage(1)));
    if (startPage > 2) controls.appendChild(createEllipsis());
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = createPageButton(i, () => renderOrdersPage(i));
    if (i === currentPage) {
      pageBtn.disabled = true;
      pageBtn.style.backgroundColor = "#888";
    }
    controls.appendChild(pageBtn);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) controls.appendChild(createEllipsis());
    controls.appendChild(
      createPageButton(totalPages, () => renderOrdersPage(totalPages))
    );
  }

  if (currentPage < totalPages) {
    controls.appendChild(
      createPageButton("Next →", () => renderOrdersPage(currentPage + 1))
    );
    controls.appendChild(
      createPageButton("Last »", () => renderOrdersPage(totalPages))
    );
  }

  const jumpWrapper = document.createElement("div");
  jumpWrapper.style.marginLeft = "12px";
  jumpWrapper.style.display = "flex";
  jumpWrapper.style.alignItems = "center";
  jumpWrapper.style.gap = "6px";

  const jumpLabel = document.createElement("span");
  jumpLabel.textContent = "Go to:";
  jumpLabel.style.fontSize = "13px";
  jumpLabel.style.color = "#ccc";

  const jumpInput = document.createElement("input");
  jumpInput.type = "number";
  jumpInput.min = 1;
  jumpInput.max = totalPages;
  jumpInput.style.width = "50px";
  jumpInput.style.padding = "2px 4px";
  jumpInput.style.fontSize = "14px";
  jumpInput.style.borderRadius = "4px";
  jumpInput.style.border = "1px solid #666";
  jumpInput.value = currentPage;

  jumpInput.onchange = () => {
    const val = parseInt(jumpInput.value);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      renderOrdersPage(val);
    }
  };

  jumpWrapper.appendChild(jumpLabel);
  jumpWrapper.appendChild(jumpInput);
  controls.appendChild(jumpWrapper);

  order_add_cards.appendChild(controls);
}

function createPageButton(label, onClick) {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.onclick = onClick;
  return btn;
}

function createEllipsis() {
  const span = document.createElement("span");
  span.textContent = "...";
  span.style.padding = "0 6px";
  span.style.color = "#ccc";
  return span;
}

function showEachOrder(name, type, qty, avg, time) {
  const typeLabel =
    type === "b"
      ? `<span class="pc">BUY</span><span class="mob">B</span>`
      : `<span class="pc">SELL</span><span class="mob">S</span>`;
  const orderClass = type === "b" ? "green" : "red";

  order_add_cards.innerHTML += `
    <div class="holding-card ${orderClass}">
      <div class="holding-scrip">
        <p>${typeLabel}</p>
        <p>${name}</p>
        <p><span class="pc">Qty</span> ${qty} @ <span class="pc">₹</span> ${avg}</p>
        <p>${time}</p>
      </div>
    </div>`;
}

function parseTimeDesc(dateStr) {
  const [datePart, timePart, ampm] = dateStr.split(" ");
  const [day, month, year] = datePart.split("-").map(Number);
  let [hours, minutes, seconds] = timePart.split(":").map(Number);

  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
}
