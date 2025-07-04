function logoutStyle() {
  document.getElementById("user_card").style.display = "none";
  document.getElementById("login_card").style.display = "flex";
  document.getElementById("holding_section").style.display = "none";
  document.getElementById("order_section").style.display = "none";
  document.getElementById("addFunds").style.display = "none";
}

function loginStyle() {
  document.getElementById("login_card").style.display = "none";
  document.getElementById("user_card").style.display = "flex";
  document.getElementById("user_card").style.flexDirection = "column";
  document.getElementById("holding_section").style.display = "flex";
  document.getElementById("holding_section").style.flexDirection = "column";
  document.getElementById("order_section").style.display = "flex";
  document.getElementById("order_section").style.flexDirection = "column";
  document.getElementById("addFunds").style.display = "flex";
}
