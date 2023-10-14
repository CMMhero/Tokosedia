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
    card.className = "col mb-5";
    card.innerHTML = `
      <div class="card h-100">
        <img class="card-img-top item-thumbnail" src="${item.image}" alt="${item.name}" />
        <div class="card-body">
            <div class="">
                <h6 class="fw-bolder">${item.name}</h6>
                ${formatPrice(item.price)}
            </div>
        </div>
        <div class="card-footer border-top-0 bg-transparent">
        <div class="container">
          <div class="row pb-2">
            <div class="col input-group border rounded p-0">
                <button class="btn btn-sm bi-dash" onclick="decrementQuantity('${item.id}')"></button>
                <input type="NumberFormat" class="form-control bg-transparent text-center border-0 p-1" id="${item.id}-quantity" value="1" min="1">
                <button class="btn btn-sm bi-plus" onclick="incrementQuantity('${item.id}')"></button>
            </div>
            <div class="col">
              <button class="btn btn-success bi-plus" onclick="addToCart('${item.id}')">
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
function incrementQuantity(itemName) {
  const quantityInput = document.getElementById(`${itemName}-quantity`);
  quantityInput.value = parseInt(quantityInput.value) + 1;
}

function decrementQuantity(itemName) {
  const quantityInput = document.getElementById(`${itemName}-quantity`);
  const currentQuantity = parseInt(quantityInput.value);
  if (currentQuantity > 0) {
    quantityInput.value = currentQuantity - 1;
  }
}

function formatPrice(price) {
  return "Rp " + new Intl.NumberFormat('id-ID').format(price);
}

function addToCart(item) {
  existingItem = cart.find(cartItem => cartItem.name === item);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    newItem = { title: item, quantity: 1 };
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