// ═══════════════════════════════════════
//   SITARA COFFEE — App Logic (Demo UI)
// ═══════════════════════════════════════

// ─── CART STATE ───
let cart = [];

// ─── PAGE ROUTING ───
function showPage(id) {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('page-' + id).classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'menu') renderMenu();
  if (id === 'order') renderOrderSummary();
  if (id === 'thankyou') launchConfetti();
}

// ─── CART DRAWER ───
function openCart() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartDrawer();
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function updateCartBadge() {
  var total = cart.reduce(function(s, i) { return s + i.qty; }, 0);
  var badge = document.getElementById('cart-count');
  badge.textContent = total;
  badge.classList.toggle('visible', total > 0);
}

function addToCart(id) {
  var item = menuItems.find(function(m) { return m.id === id; });
  if (!item) return;
  var existing = cart.find(function(c) { return c.id === id; });
  if (existing) {
    existing.qty++;
  } else {
    cart.push(Object.assign({}, item, { qty: 1 }));
  }
  updateCartBadge();
  renderCartDrawer();
  renderOrderSummary();
  showToast(item.emoji + ' ' + item.name + ' added!');
}

function removeFromCart(id) {
  cart = cart.filter(function(c) { return c.id !== id; });
  updateCartBadge();
  renderCartDrawer();
  renderOrderSummary();
}

function changeQty(id, delta) {
  var item = cart.find(function(c) { return c.id === id; });
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
  } else {
    updateCartBadge();
    renderCartDrawer();
    renderOrderSummary();
  }
}

function getCartTotals() {
  var subtotal = cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0);
  var tax = Math.round(subtotal * 0.05);
  var packaging = cart.length > 0 ? 10 : 0;
  var total = subtotal + tax + packaging;
  return { subtotal: subtotal, tax: tax, packaging: packaging, total: total };
}

function renderCartDrawer() {
  var container = document.getElementById('cart-items-list');
  var footer = document.getElementById('cart-footer');

  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty"><div class="empty-icon">🛒</div><p>Your cart is empty</p><a onclick="closeCart(); showPage(\'menu\')">Browse our menu →</a></div>';
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';
  var totals = getCartTotals();

  container.innerHTML = cart.map(function(item) {
    return '<div class="cart-item" id="cart-item-' + item.id + '">' +
      '<div class="cart-item-emoji">' + item.emoji + '</div>' +
      '<div class="cart-item-info">' +
        '<div class="cart-item-name">' + item.name + '</div>' +
        '<div class="cart-item-price">₹' + item.price + '</div>' +
        '<div class="cart-item-controls">' +
          '<button class="qty-btn" onclick="changeQty(' + item.id + ', -1)">−</button>' +
          '<span class="qty-num">' + item.qty + '</span>' +
          '<button class="qty-btn" onclick="changeQty(' + item.id + ', +1)">+</button>' +
          '<button class="remove-btn" onclick="removeFromCart(' + item.id + ')">Remove</button>' +
        '</div>' +
      '</div>' +
      '<div style="color:var(--gold);font-family:\'Playfair Display\',serif;font-size:.95rem;flex-shrink:0;">₹' + (item.price * item.qty) + '</div>' +
    '</div>';
  }).join('');

  document.getElementById('cart-subtotal').textContent = '₹' + totals.subtotal;
  document.getElementById('cart-tax').textContent = '₹' + totals.tax;
  document.getElementById('cart-packaging').textContent = '₹' + totals.packaging;
  document.getElementById('cart-grand-total').textContent = '₹' + totals.total;
}

// ─── MENU RENDER ───
function renderMenu(tag) {
  tag = tag || 'all';
  var grid = document.getElementById('menu-grid');
  var items = tag === 'all' ? menuItems : menuItems.filter(function(i) { return i.tag === tag; });
  var bgMap = { hot: '#F5EFE0', cold: '#E8F4F8', food: '#FFF8F0' };

  grid.innerHTML = items.map(function(item) {
    var inCart = cart.find(function(c) { return c.id === item.id; });
    return '<div class="menu-card">' +
      '<div class="card-img" style="background:' + (bgMap[item.tag] || '#FFF') + '">' +
        '<span style="font-size:4rem">' + item.emoji + '</span>' +
        (item.badge ? '<div class="card-badge">' + item.badge + '</div>' : '') +
      '</div>' +
      '<div class="card-body">' +
        '<div class="card-name">' + item.name + '</div>' +
        '<div class="card-desc">' + item.desc + '</div>' +
        '<div class="card-footer">' +
          '<div class="card-price">₹' + item.price + '</div>' +
          '<button class="add-btn' + (inCart ? ' added' : '') + '" onclick="addToCart(' + item.id + '); this.classList.add(\'added\'); this.textContent=\'✓\'; var btn=this; setTimeout(function(){btn.textContent=\'+\';btn.classList.remove(\'added\')},1000)">' +
            (inCart ? '✓' : '+') +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function filterMenu(tag, btn) {
  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  renderMenu(tag);
}

// ─── ORDER SUMMARY SIDEBAR ───
function renderOrderSummary() {
  var container = document.getElementById('order-summary-content');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<div class="summary-empty"><div class="emoji">☕</div><p>Add items from the menu<br>to see your order here</p><a onclick="showPage(\'menu\')" style="color:var(--gold);cursor:pointer;font-size:.82rem;">Browse Menu →</a></div>';
    return;
  }

  var totals = getCartTotals();

  container.innerHTML =
    '<div class="os-list">' +
    cart.map(function(item) {
      return '<div class="os-item">' +
        '<div class="os-item-left">' +
          '<div class="os-item-emoji">' + item.emoji + '</div>' +
          '<div><div class="os-item-name">' + item.name + '</div><span class="os-item-qty">x' + item.qty + '</span></div>' +
        '</div>' +
        '<div class="os-item-price">₹' + (item.price * item.qty) + '</div>' +
      '</div>';
    }).join('') +
    '</div>' +
    '<div class="os-divider"></div>' +
    '<div class="os-row"><span>Subtotal</span><span>₹' + totals.subtotal + '</span></div>' +
    '<div class="os-row"><span>Taxes (5%)</span><span>₹' + totals.tax + '</span></div>' +
    '<div class="os-row"><span>Packaging</span><span>₹' + totals.packaging + '</span></div>' +
    '<div class="os-divider"></div>' +
    '<div class="os-total"><span>Total</span><span>₹' + totals.total + '</span></div>' +
    '<p class="os-note">✦ Free delivery on orders above ₹500</p>';
}

// ─── PAYMENT METHOD (demo notices only, no real input collection) ───
function handlePaymentChange(val) {
  document.getElementById('card-details').classList.remove('visible');
  document.getElementById('upi-details').classList.remove('visible');
  document.getElementById('cod-details').classList.remove('visible');
  if (val === 'card') document.getElementById('card-details').classList.add('visible');
  if (val === 'upi') document.getElementById('upi-details').classList.add('visible');
  if (val === 'cod') document.getElementById('cod-details').classList.add('visible');
}

// ─── PLACE ORDER (demo — no real transaction) ───
function placeOrder() {
  var fname = document.getElementById('ord-fname') ? document.getElementById('ord-fname').value.trim() : '';
  var phone = document.getElementById('ord-phone') ? document.getElementById('ord-phone').value.trim() : '';
  var paymentEl = document.querySelector('input[name="payment"]:checked');

  if (!fname) { showToast('⚠ Please enter your name'); return; }
  if (!phone) { showToast('⚠ Please enter your phone number'); return; }
  if (!paymentEl) { showToast('⚠ Please select a payment method'); return; }
  if (cart.length === 0) { showToast('⚠ Your cart is empty!'); return; }

  var paymentLabels = { card: 'Card (Demo)', upi: 'UPI (Demo)', cod: 'Cash on Delivery (Demo)' };
  var orderId = '#SC-' + Math.floor(Math.random() * 9000 + 1000);

  document.getElementById('ty-order-num').textContent = orderId;
  document.getElementById('ty-payment-method').textContent =
    'Demo — ' + (paymentLabels[paymentEl.value] || 'Payment') + ' · ₹' + getCartTotals().total;

  // Clear cart after demo order
  cart = [];
  updateCartBadge();

  showPage('thankyou');
}

// ─── AUTH (demo only) ───
function toggleAuth() {
  var login = document.getElementById('login-form-box');
  var signup = document.getElementById('signup-form-box');
  if (login.style.display === 'none') {
    login.style.display = 'block';
    signup.style.display = 'none';
  } else {
    login.style.display = 'none';
    signup.style.display = 'block';
  }
}

function handleLogin() {
  showToast('✦ Welcome to Sitara Coffee! (Demo)');
  setTimeout(function() { showPage('home'); }, 900);
}

// ─── CONFETTI ───
function launchConfetti() {
  var container = document.getElementById('confetti-container');
  container.innerHTML = '';
  var colors = ['#C9943A', '#F5EFE0', '#8B5E3C', '#D4A96A', '#fff'];
  var shapes = ['50%', '2px'];
  for (var i = 0; i < 50; i++) {
    var dot = document.createElement('div');
    dot.className = 'confetti-dot';
    var size = Math.random() * 8 + 4;
    dot.style.cssText =
      'left:' + (Math.random() * 100) + '%;' +
      'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
      'width:' + size + 'px;height:' + size + 'px;' +
      'border-radius:' + shapes[Math.floor(Math.random() * shapes.length)] + ';' +
      'animation-duration:' + (Math.random() * 3 + 2) + 's;' +
      'animation-delay:' + (Math.random() * 2) + 's;';
    container.appendChild(dot);
  }
}

// ─── TOAST ───
function showToast(msg) {
  var t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.remove(); }, 3000);
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', function() {
  renderMenu();

  // Show COD notice by default (since COD is pre-selected)
  var codDetails = document.getElementById('cod-details');
  if (codDetails) codDetails.classList.add('visible');

  // Order type toggle for delivery address
  var typeSelect = document.getElementById('ord-type');
  if (typeSelect) {
    typeSelect.addEventListener('change', function() {
      document.getElementById('addr-field').style.display =
        this.value === 'Delivery' ? 'block' : 'none';
    });
  }

  // Payment radio listeners — show demo notice, not real input fields
  document.querySelectorAll('input[name="payment"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      handlePaymentChange(radio.value);
    });
  });
});
