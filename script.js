let isLoggedIn = localStorage.getItem("loggedIn") || false;
let username = localStorage.getItem("username") || "";
let balance = 0;
let cart = localStorage.getItem("cart") || [];
let cartLength = 0;

getData();
loadNavbar();
loadCart();
loadCartItems();

$("#loginForm").submit(function (event) {
  event.preventDefault();
  const username = $("#username").val();
  const password = $("#password").val();

  localStorage.setItem("username", username);
  localStorage.setItem("loggedIn", true);
  window.location.href = "index.html";
});

$("#nav-cart").click(function () {
  if (isLoggedIn == "false") window.location.href = "login.html";
  window.location.href = "cart.html";
});

$("#nav-login").click(function () {
  window.location.href = "login.html";
});

$("#nav-logout").click(function () {
  localStorage.setItem("loggedIn", false);
  localStorage.setItem("username", "");
  window.location.href = "login.html";
});

$(".cart-item-quantity").change(function () {
  console.log("nice");
  let quantity = $(`#${itemId}-quantity`);
  let currentQuantity = parseInt(quantity.val());

  if (currentQuantity <= 1) return;

  let cartItem = cart.find(item => item.id == itemId);
  if (cartItem) {
    cartItem.quantity = currentQuantity;
  }

  saveCart();
  updateTotal();
  updateCart();
});

async function getData() {
  const response = await fetch("data.json");
  const data = await response.json();
  items = data.products;
  items.forEach(item => {
    $("#items").append(
      `
        <div class="col gy-4">
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
        </div>
      `
    )
  });
}

function incrementQuantity(itemId) {
  let quantity = $(`#${itemId}-quantity`);
  let quantityValue = parseInt(quantity.val());
  quantity.val(quantityValue + 1);
}

function decrementQuantity(itemId) {
  let quantity = $(`#${itemId}-quantity`);
  let currentQuantity = parseInt(quantity.val());

  if (currentQuantity <= 1) return

  quantity.val(currentQuantity - 1);
}

function incrementQuantityCart(itemId) {
  let quantity = $(`#${itemId}-quantity`);
  let currentQuantity = parseInt(quantity.val());
  quantity.val(currentQuantity + 1);

  let cartItem = cart.find(item => item.id == itemId);
  if (cartItem) {
    cartItem.quantity = currentQuantity + 1;
  }

  updateCart();
  saveCart();
  updateTotal();
}

function decrementQuantityCart(itemId) {
  let quantity = $(`#${itemId}-quantity`);
  let currentQuantity = parseInt(quantity.val());

  if (currentQuantity <= 1) return
  quantity.val(currentQuantity - 1);

  let cartItem = cart.find(item => item.id == itemId);
  if (cartItem) {
    cartItem.quantity = currentQuantity - 1;
  }

  updateCart();
  saveCart();
  updateTotal();
}

function deleteItemFromCart(itemId) {
  cart = cart.filter(item => item.id != itemId);

  updateCart();
  saveCart();
  updateTotal();
  loadCartItems();
}

function formatPrice(price) {
  return "Rp " + new Intl.NumberFormat('id-ID').format(price);
}

function addToCart(item) {
  if (isLoggedIn == "false") window.location.href = "login.html";

  existingItem = cart.find(cartItem => cartItem.id == item);

  const quantity = parseInt($(`#${item}-quantity`).val());

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.checked = true;
  } else {
    newItem = { id: item, quantity: quantity, checked: true };
    cart.push(newItem);
  }

  cartNotification(item, quantity);
  updateCart();
  saveCart();
}

async function loadCartItems() {
  $("#cart-items").html("");

  cart.forEach(async item => {
    itemDetail = await findCartItemById(item.id);


    $("#cart-items").append(
      `
        <div class="mb-3">
          <div class="card rounded-4 shadow-sm">
            <div class="d-flex p-3 align-items-center overflow-hidden">
              <input class="form-check-input border-secondary border-2 me-3" type="checkbox" ${item.checked == true ? 'checked' : 'unchecked'}>
              <img class="img-fluid rounded item-thumbnail-small border shadow-sm" src="${itemDetail.image}" alt="${itemDetail.name}" />
              <div class="ms-3 ms-lg-4">
                <h6 class="card-title fw-bolder">${itemDetail.name}</h6>
                <p class="card-text">${formatPrice(itemDetail.price)}</p>
                <div class="d-flex">
                <div class="input-group border rounded p-0 input-cart">
                  <button class="btn btn-sm bi-dash" onclick="decrementQuantityCart('${itemDetail.id}')"></button>
                  <input type="NumberFormat" class="cart-item-quantity form-control bg-transparent text-center border-0" id="${itemDetail.id}-quantity" value="${item.quantity}" min="1">
                  <button class="btn btn-sm bi-plus" onclick="incrementQuantityCart('${itemDetail.id}')"></button>
                </div>
                <button class="btn btn-outline-danger ms-2" onclick="deleteItemFromCart('${itemDetail.id}')">
                  <i class="bi-trash-fill"></i>
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    );
  })

  if (!cart.length) {
    $("#cart-items").append(
      `
      <div class="mb-3">
        <div class="card rounded-4 shadow-sm">
          <div class="p-3 align-items-center">
            <h5>You have no items in your cart</h5>
            Start by adding some recommended items
          </div>
        </div>
      </div>
      `
    );
  }

  updateTotal();
}

async function updateTotal() {
  let totalItems = 0;
  let totalPrice = 0;

  for (const item of cart) {
    if (item.checked == true) {
      itemDetail = await findCartItemById(item.id);
      totalItems += item.quantity;
      totalPrice += itemDetail.price * item.quantity;
    }
  }

  $("#total").html(
    `
      <div class="sticky-div">
        <div class="card mb-4 h-100 rounded-4 shadow">
          <div class="card-body">
            <h6 class="card-title fw-bolder">${totalItems} Items</h6>
            <p class="card-text">${formatPrice(totalPrice)}</p>
          </div>
        </div>
      </div>
    `
  );
}

async function cartNotification(id, quantity) {
  const item = await findCartItemById(id);

  const alertHtml = `
  <div class="alert alert-success alert-dismissible fade show m-4" role="alert">
    <i class="bi-check-circle-fill me-2"></i>
    Added ${quantity}x <strong>${item.name}</strong> to cart!
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>
    `;

  $('#notification').append(alertHtml);

  setTimeout(function () {
    $(`.alert`).alert('close');
  }, 2000);
}


async function findCartItemById(id) {
  const response = await fetch("data.json");
  const data = await response.json();
  items = data.products;
  const item = items.find(item => item.id == id);

  if (item) {
    return item;
  } else {
    return null;
  }
}


function updateCart() {
  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  $("#cartItems").text(totalQuantity);
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  if (isLoggedIn == "false") return;

  cart = JSON.parse(localStorage.getItem("cart")) || [];
  updateCart();
}

function loadNavbar() {
  if (isLoggedIn == "true") {
    $("#nav-balance").show();
    $("#nav-login").hide();
    $("#nav-logout").show();
  } else {
    $("#nav-balance").hide();
    $("#nav-login").show();
    $("#nav-logout").hide();
  }
}