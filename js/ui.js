export let email = document.getElementById("email");
export let password = document.getElementById("password");
export let loginBtn = document.getElementById("loginBtn");
export let logoutBtn = document.getElementById("logoutBtn");

export let user_email = document.getElementById("user_email");
export let user_margin = document.getElementById("user_margin");

export let place_order_scrip = document.getElementById("place_order_scrip");
export let place_order_qty = document.getElementById("place_order_qty");
export let place_order_price = document.getElementById("place_order_price");

export let place_buy = document.getElementById("place_buy");
export let place_sell = document.getElementById("place_sell");

export let holding_totInvested = document.getElementById("holding_totInvested");
export let holding_totCurrent = document.getElementById("holding_totCurrent");

export let holding_totpnl = document.getElementById("holding_totpnl");
export let holding_totpnlprcnt = document.getElementById("holding_totpnlprcnt");

export let holding_add_cards = document.getElementById("holding_add_cards");
export let order_add_cards = document.getElementById("order_add_cards");

export function logoutStyle() {
  document.getElementById("user_card").style.display = "none";
  document.getElementById("login_card").style.display = "flex";
  document.getElementById("holding_section").style.display = "none";
  document.getElementById("order_section").style.display = "none";
  // document.getElementById("addFunds").style.display = "none";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("signupBtn").style.display = "";
}

export function loginStyle() {
  document.getElementById("login_card").style.display = "none";
  document.getElementById("user_card").style.display = "flex";
  document.getElementById("user_card").style.flexDirection = "column";
  document.getElementById("holding_section").style.display = "flex";
  document.getElementById("holding_section").style.flexDirection = "column";
  document.getElementById("order_section").style.display = "flex";
  document.getElementById("order_section").style.flexDirection = "column";
  document.getElementById("signupBtn").style.display = "none";

  // document.getElementById("addFunds").style.display = "flex";
}

export function showUserInfo(email, margin) {
  document.getElementById("user_email").textContent = email;
  document.getElementById("user_margin").textContent = `₹ ${margin.toFixed(2)}`;
}

export function showError(message) {
  alert(message);
  console.error(message);
}

const navItems = document.querySelectorAll(".bottom-navbar .nav-item");
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");

    const sectionId = item.querySelector("p").textContent.toLowerCase();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  });
});
