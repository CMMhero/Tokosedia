let isLoggedIn = localStorage.getItem("loggedIn") || false;
let username = localStorage.getItem("username") || "";
let balance = localStorage.getItem("balance") || 1000000;
let cart = localStorage.getItem("cart") || [];
let cartLength = 0;
let toastCount = 0;

loadData();
loadNavbar();
loadHeader();
loadCart();
loadCartItems();
loadBalance();

$("#loginForm").submit(function (event) {
  event.preventDefault();
  const username = $("#username").val();
  // const password = $("#password").val();

  localStorage.setItem("username", username);
  localStorage.setItem("loggedIn", true);
  window.location.href = "index.html";
});

let topupModal = false;
$("#nav-balance").click(function () {
  if (!topupModal) {
    html =
      `
    <div class="modal fade" id="topup-modal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h1 class="modal-title fs-5">Topup Balance</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <span class="input-group-text">Rp</span>
              <input type="number" id="topup-amount" class="form-control input-number" aria-label="Topup Balance">
            </div>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="topUp()">Topup</button>
          </div>
        </div>
      </div>
    </div>
    `

    $("body").append(html);
    topupModal = true;
  }

  $('#topup-modal').modal('show');
})

$("#nav-cart").click(function () {
  if (isLoggedIn == "false") return window.location.href = "login.html";
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

function removeModal(id) {
  $(`#${id}`).remove();
}

function transactionNotification(amount) {
  modalId = `transaction-modal-${toastCount++}`
  html =
    `
    <div class="modal fade" id="${modalId}" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h1 class="modal-title fs-5">Transaction Successful</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Congratulations ${username}!<br/>Your transaction of <strong>${formatPrice(amount)}</strong> is successful.
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" onclick="removeModal('${modalId}')">OK</button>
            <a href="index.html" type="button" class="btn btn-primary">Shop Again</a>
          </div>
        </div>
      </div>
    </div>
    `

  $("body").append(html);

  $(`#${modalId}`).modal('show');
}

function topUp() {
  const amount = parseInt($("#topup-amount").val());
  if (isNaN(amount) || amount == 0) return;

  const bal = parseInt(balance);

  balance = bal + amount;

  saveBalance();
  loadBalance();

  $('#topup-modal').modal('hide');

  showToast(`Topup of <strong>${formatPrice(amount)}</strong> successful.`, "bi-check-circle-fill", "text-bg-success");
}

function loadHeader() {
  if (isLoggedIn == "false") return;

  $("#user").html(`
    <h3 class="mb-4">Welcome, ${username}</h3>
  `);
}

async function loadData() {
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
                  <div class="input-cart col-sm-6 col-md-8 col-lg-8 col-xl input-group border rounded p-0">
                      <button class="btn btn-sm bi-dash px-1" onclick="decrementQuantity('${item.id}')"></button>
                      <input type="number" class="input-number form-control bg-transparent text-center border-0 px-1" id="${item.id}-quantity" value="1" min="1">
                      <button class="btn btn-sm bi-plus px-1" onclick="incrementQuantity('${item.id}')"></button>
                  </div>
                  <div class="col-sm-6 col-md-8 col-lg-8 col-xl p-0 ms-xl-2">
                    <button class="btn btn-success" onclick="addToCart(${item.id})">
                      + Cart
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

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function loadRecommended() {
  const response = await fetch("data.json");
  const data = await response.json();
  items = data.products;

  shuffle(items);
  let recommendedItems = items.slice(0, 9);

  recommendedItems.forEach(item => {
    $("#recommended-items").append(
      `
        <div class="col gy-4 id="recommended-item-id-${item.id}"">
          <div class="card h-100 rounded-4 shadow">
              <img class="img-fluid card-img-top item-thumbnail rounded-top-4 border-bottom" src="${item.image}" alt="${item.name}" />
              <div class="card-body">
                <h6 class="fw-bolder">${item.name}</h6>
                ${formatPrice(item.price)}
              </div>
              <div class="card-footer border-top-0 bg-transparent pt-0">
              <div class="container">
                <div class="row pb-2 gy-2">
                  <div class="input-cart col-sm-6 col-md-8 col-lg-8 col-xl input-group border rounded p-0">
                      <button class="btn btn-sm bi-dash px-1" onclick="decrementQuantity('${item.id}')"></button>
                      <input type="number" class="input-number form-control bg-transparent text-center border-0 px-1" id="${item.id}-quantity" value="1" min="1">
                      <button class="btn btn-sm bi-plus px-1" onclick="incrementQuantity('${item.id}')"></button>
                  </div>
                  <div class="col-sm-6 col-md-8 col-lg-8 col-xl p-0 ms-xl-2">
                    <button class="btn btn-success" onclick="addToCart(${item.id})">
                      + Cart
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
  let quantity = $(`#${itemId}-cart-quantity`);
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
  let quantity = $(`#${itemId}-cart-quantity`);
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

function updateQuantityCart(itemId) {
  let quantity = $(`#${itemId}-cart-quantity`);
  let currentQuantity = parseInt(quantity.val());

  if (currentQuantity <= 0) return;

  let cartItem = cart.find(item => item.id == itemId);
  if (cartItem) {
    cartItem.quantity = currentQuantity;
  }

  updateCart();
  saveCart();
  updateTotal();
}

function checkItemCart(itemId) {
  let cartItem = cart.find(item => item.id == itemId);
  if (cartItem) {
    cartItem.checked = !cartItem.checked;
  }

  updateCart();
  saveCart();
  updateTotal();
}

function deleteItemFromCart(itemId, button) {
  cart = cart.filter(item => item.id != itemId);
  $(button).closest('div.cart-item').fadeOut(function () {
    $(this).remove();
  });

  deleteNotification(itemId);

  updateCart();
  saveCart();
  updateTotal();

  if (!cart.length) {
    $("#cart-empty").fadeIn();
  }
}

function formatPrice(price) {
  return "Rp " + new Intl.NumberFormat('id-ID').format(price);
}

function addToCart(id) {
  if (isLoggedIn == "false") window.location.href = "login.html";

  existingItem = cart.find(cartItem => cartItem.id == id);

  const quantity = parseInt($(`#${id}-quantity`).val());

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.checked = true;
    $(`#${id}-cart-quantity`).val(existingItem.quantity);
    $(`#cart-item-${id}-checkbox`).prop('checked', true);
  } else {
    newItem = { id: id, quantity: quantity, checked: true };
    cart.push(newItem);
    cartAppend(id, newItem);
  }

  if (cart.length) {
    $("#cart-empty").fadeOut();
  }

  cartNotification(id, quantity);
  updateCart();
  saveCart();
  updateTotal();
}

async function cartAppend(id, item) {
  itemDetail = await findCartItemById(id);

  cartItem = $(`
      <div class="mb-3 cart-item" id="cart-item-id-${item.id}">
        <div class="card rounded-4 shadow-sm">
          <div class="d-flex p-3 align-items-center overflow-hidden">
            <input id="cart-item-${item.id}-checkbox" class="form-check-input border-secondary border-2 me-3" type="checkbox" ${item.checked == true ? 'checked' : 'unchecked'} onchange="checkItemCart('${item.id}')">
            <img class="img-fluid rounded item-thumbnail-small border shadow-sm" src="${itemDetail.image}" alt="${itemDetail.name}" />
            <div class="ms-3 ms-lg-4">
              <h6 class="card-title fw-bolder">${itemDetail.name}</h6>
              <p class="card-text">${formatPrice(itemDetail.price)}</p>
              <div class="d-flex">
              <div class="input-group border rounded p-0 input-cart">
                <button class="btn btn-sm bi-dash px-1" onclick="decrementQuantityCart('${item.id}')"></button>
                <input type="number" class="input-number form-control bg-transparent text-center border-0" id="${item.id}-cart-quantity" value="${item.quantity}" min="1" onchange="updateQuantityCart('${item.id}')">
                <button class="btn btn-sm bi-plus px-1" onclick="incrementQuantityCart('${item.id}')"></button>
              </div>
              <button class="btn btn-outline-danger ms-2" onclick="deleteItemFromCart('${item.id}', this)">
                <i class="bi-trash-fill"></i>
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).hide().fadeIn()

  $("#cart-items").append(cartItem);
}

function checkOut(price) {
  if (price == 0) {
    return;
  }

  if (balance < price) {
    showToast("Insufficient balance. Please topup.", "bi-x-circle-fill", "text-bg-danger")
    return;
  }

  cart.forEach(async item => {
    if (item.checked) {
      $(`#cart-item-id-${item.id}`).fadeOut(function() {
        $(this).remove();
      });
    }
  });
  cart = cart.filter(item => !item.checked);
  saveCart();
  updateCart();

  if (!cart.length) {
    $("#cart-empty").fadeIn();
  }

  balance -= price;
  saveBalance();
  
  loadCart();
  loadBalance();

  updateTotal();

  transactionNotification(price);
}

async function loadCartItems() {
  cart.forEach(async item => {
    itemDetail = await findCartItemById(item.id);

    $("#cart-items").append(
      `
        <div class="mb-3 cart-item" id="cart-item-id-${item.id}">
          <div class="card rounded-4 shadow-sm">
            <div class="d-flex p-3 align-items-center overflow-hidden">
              <input id="cart-item-${item.id}-checkbox" class="form-check-input border-secondary border-2 me-3" type="checkbox" ${item.checked == true ? 'checked' : 'unchecked'} onchange="checkItemCart('${item.id}')">
              <img class="img-fluid rounded item-thumbnail-small border shadow-sm" src="${itemDetail.image}" alt="${itemDetail.name}" />
              <div class="ms-3 ms-lg-4">
                <h6 class="card-title fw-bolder">${itemDetail.name}</h6>
                <p class="card-text">${formatPrice(itemDetail.price)}</p>
                <div class="d-flex">
                <div class="input-group border rounded p-0 input-cart">
                  <button class="btn btn-sm bi-dash px-1" onclick="decrementQuantityCart('${item.id}')"></button>
                  <input type="number" class="input-number form-control bg-transparent text-center border-0" id="${item.id}-cart-quantity" value="${item.quantity}" min="1" onchange="updateQuantityCart('${item.id}')">
                  <button class="btn btn-sm bi-plus px-1" onclick="incrementQuantityCart('${item.id}')"></button>
                </div>
                <button class="btn btn-outline-danger ms-2" onclick="deleteItemFromCart('${item.id}', this)">
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

  if (cart.length) {
    $("#cart-empty").fadeOut();
  } else {
    $("#cart-empty").fadeIn();
  }

  loadRecommended();
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
        <div class="card mb-4 h-100 rounded-4 shadow-sm">
          <div class="card-body">
            <h5 class="card-title fw-bolder">Order Summary</h5>
            <hr/>
            <div class="d-flex">
              <div>
                Items
              </div>
              <div class="ms-auto">
                ${totalItems}
              </div>
            </div>
            <div class="d-flex">
              <div>
                <b class="fw-bolder">Total</b>
              </div>
              <div class="ms-auto">
                <b class="fw-bolder">${formatPrice(totalPrice)}</b>
              </div>
            </div>
            ${totalItems > 0 && totalPrice > 0 ? `            <button id="checkout" class="btn btn-success mt-2 bi-cart-fill" onclick="checkOut(${totalPrice})">
              Checkout
            </button>` : ``}
          </div>
        </div>
      </div>
    `
  );
}

async function cartNotification(id, quantity) {
  const item = await findCartItemById(id);

  showToast(`Added ${quantity}x <strong>${item.name}</strong> to cart!`, "bi-check-circle-fill", "text-bg-primary")
}

async function deleteNotification(id) {
  const item = await findCartItemById(id);

  showToast(`Deleted <strong>${item.name}</strong> from cart`, "bi-check-circle-fill", "text-bg-danger")
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

function showToast(message, icon, textBackground) {
  const toastId = `toast-${toastCount++}`;

  const alertHtml = `
    <div class="toast ${textBackground}" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="2000" id="${toastId}">
      <div class="d-flex">
        <div class="toast-body">
          <i class="${icon} me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  $('#notification').append(alertHtml);

  const toastElement = $(`#${toastId}`);
  bootstrap.Toast.getOrCreateInstance(toastElement).show();
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

function loadBalance() {
  $("#balance").text(formatPrice(balance));
}

function saveBalance() {
  localStorage.setItem("balance", balance)
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