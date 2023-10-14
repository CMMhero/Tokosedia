let username = localStorage.getItem("username") || "";
let balance = 0;
let cart = localStorage.getItem("cart") || [];
let cartLength = 0;

getData();
loadCart();
document.name = document.name + " | Tokosedia";

$("#loginForm").submit(function (event) {
  event.preventDefault();
  const username = $("#username").val();
  const password = $("#password").val();

  localStorage.setItem("username", username);
  localStorage.setItem("loggedIn", "true");
  window.location.href = "index.html";
});

// Handle the logout button
$("#logout").click(function () {
  localStorage.setItem("loggedIn", "false");
  window.location.href = "login.html";
});

async function getData() {
  const itemListElement = document.getElementById("items");

  // Fetch data from the API
  const response = await fetch("data.json");
  const data = await response.json();
  items = data.products;
  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "col mb-4";
    card.innerHTML = `
      <div class="card h-100 rounded-4 shadow">
        <img class="img-fluid card-img-top item-thumbnail rounded-top-4 border-bottom" src="${item.image}" alt="${item.name}" />
        <div class="card-body">
          <h6 class="fw-bolder">${item.name}</h6>
          ${formatPrice(item.price)}
        </div>
        <div class="card-footer border-top-0 bg-transparent pt-0">
        <div class="container">
          <div class="row pb-2 gy-2">
            <div class="col-sm-6 col-md-8 col-lg input-group border rounded p-0">
                <button class="btn btn-sm bi-dash" onclick="decrementQuantity('${item.id}')"></button>
                <input type="NumberFormat" class="form-control bg-transparent text-center border-0" id="${item.id}-quantity" value="1" min="1">
                <button class="btn btn-sm bi-plus" onclick="incrementQuantity('${item.id}')"></button>
            </div>
            <div class="col-sm-6 col-md-8 col-lg p-0 ms-lg-2">
              <button class="btn btn-success bi-plus" onclick="addToCart(${item.id})">
                  Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    `;
    itemListElement.appendChild(card);
  });
}

// Functions to increment and decrement the quantity
function incrementQuantity(itemId) {
  let quantity = $(`#${itemId}-quantity`);
  let quantityValue = parseInt(quantity.val());
  quantity.val(quantityValue + 1);
}

function decrementQuantity(itemId) {
  let quantity = $(`#${itemId}-quantity`);
  let currentQuantity = parseInt(quantity.val());
  if (currentQuantity > 1) {
    quantity.val(currentQuantity - 1);
  }
}

function formatPrice(price) {
  return "Rp " + new Intl.NumberFormat('id-ID').format(price);
}

function addToCart(item) {
  existingItem = cart.find(cartItem => cartItem.id === item);

  const quantity = parseInt($(`#${item}-quantity`).val());

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    newItem = { id: item, quantity: quantity };
    cart.push(newItem);
  }

  updateCart();
  saveCart();
}

function updateCart() {
  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  $("#cartItems").text(totalQuantity);
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  updateCart();
}