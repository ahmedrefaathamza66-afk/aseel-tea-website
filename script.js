
'use strict';

// ===== CART =====
var cart = [];

// ===== ADD TO CART BY ID =====
var PRODUCTS = [
  { id: 1, name: 'شاي أسمر أصيل', weight: '40 جرام', price: 10, category: 'black' },
  { id: 2, name: 'شاي أسمر أصيل', weight: '100 جرام', price: 30, category: 'black' },
  { id: 3, name: 'شاي أسمر أصيل', weight: '250 جرام', price: 55, category: 'black' },
  { id: 4, name: 'شاي أسمر أصيل', weight: '500 جرام', price: 110, category: 'black' },
  { id: 5, name: 'شاي أسمر أصيل', weight: '1000 جرام', price: 220, category: 'black' },
  { id: 6, name: 'شاي فتلة أصيل', weight: 'فتلة', price: 0, category: 'black' },
  { id: 7, name: 'شاي كرك أصيل', weight: 'علبة 10 أكياس', price: 150, category: 'karak' }
];

var KARAK_BASE_PRICE = 560;
var selectedKarakGrams = 125;
var selectedKarakLabel = 'تمن كيلو';

function addToCartById(id) {
  var product = null;
  for (var i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].id === id) { product = PRODUCTS[i]; break; }
  }
  if (!product) { alert('منتج مش موجود'); return; }

  var found = false;
  for (var j = 0; j < cart.length; j++) {
    if (cart[j].productId === id) {
      cart[j].qty += 1;
      found = true;
      break;
    }
  }

  if (!found) {
    cart.push({
      cartId: 'item_' + Date.now() + '_' + id,
      productId: id,
      name: product.name,
      weight: product.weight,
      price: product.price,
      category: product.category,
      qty: 1
    });
  }

  showToast('✅ تم إضافة ' + product.name + ' - ' + product.weight);
  renderCart();
  openCartSidebar();
}

function addSelectedKarakToCart() {
  var price = Math.round((KARAK_BASE_PRICE / 1000) * selectedKarakGrams);
  var key = 'karak_' + selectedKarakGrams;

  var found = false;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].cartId === key) {
      cart[i].qty += 1;
      found = true;
      break;
    }
  }

  if (!found) {
    cart.push({
      cartId: key,
      productId: key,
      name: 'شاي كرك أصيل',
      weight: selectedKarakLabel,
      price: price,
      category: 'karak',
      qty: 1
    });
  }

  showToast('✅ تم إضافة كرك ' + selectedKarakLabel);
  renderCart();
  openCartSidebar();
}

function selectKarakWeight(btn) {
  var btns = document.querySelectorAll('.weight-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove('active');
  }
  btn.classList.add('active');

  selectedKarakGrams = parseFloat(btn.getAttribute('data-grams'));
  selectedKarakLabel = btn.getAttribute('data-label');

  var price = Math.round((KARAK_BASE_PRICE / 1000) * selectedKarakGrams);

  var priceEl = document.getElementById('karak-price-display');
  var weightEl = document.getElementById('karak-weight-display');

  if (priceEl) priceEl.textContent = price + ' جنيه';
  if (weightEl) weightEl.innerHTML = '<i class="fas fa-weight-hanging"></i> ' + selectedKarakLabel + ' (' + selectedKarakGrams + ' جرام)';
}

function changeItemQty(cartId, delta) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].cartId === cartId) {
      cart[i].qty = Math.max(1, cart[i].qty + delta);
      break;
    }
  }
  renderCart();
}

function removeItem(cartId) {
  var newCart = [];
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].cartId !== cartId) newCart.push(cart[i]);
  }
  cart = newCart;
  renderCart();
  showToast('🗑️ تم حذف المنتج');
}

function clearCart() {
  cart = [];
  renderCart();
  showToast('🗑️ تم إفراغ السلة');
}

function renderCart() {
  var cartItemsEl = document.getElementById('cartItems');
  var cartFooterEl = document.getElementById('cartFooter');
  var cartCountEl = document.getElementById('cartCount');
  var cartTotalEl = document.getElementById('cartTotalPrice');

  // لو أي عنصر مش موجود، وقف
  if (!cartItemsEl || !cartFooterEl || !cartCountEl || !cartTotalEl) {
    console.log('عناصر السلة مش موجودة');
    return;
  }

  // حساب الإجمالي والعدد
  var totalQty = 0;
  var totalPrice = 0;
  for (var i = 0; i < cart.length; i++) {
    totalQty += cart[i].qty;
    totalPrice += cart[i].price * cart[i].qty;
  }

  cartCountEl.textContent = totalQty;
  cartTotalEl.textContent = totalPrice + ' جنيه';

  // لو السلة فارغة
  if (cart.length === 0) {
    cartItemsEl.innerHTML =
      '<div class="cart-empty">' +
      '<i class="fas fa-shopping-basket"></i>' +
      '<p>السلة فارغة</p>' +
      '<span>أضف منتجات للسلة</span>' +
      '</div>';
    cartFooterEl.style.display = 'none';
    return;
  }

  cartFooterEl.style.display = 'block';
  cartItemsEl.innerHTML = '';

  // ارسم كل منتج لوحده
  for (var j = 0; j < cart.length; j++) {
    var item = cart[j];
    var itemTotal = item.price * item.qty;

    var div = document.createElement('div');
    div.className = 'cart-item';

    div.innerHTML =
      '<div class="cart-item-icon ' + (item.category === 'karak' ? 'karak' : '') + '">' +
      '<i class="fas fa-mug-hot"></i>' +
      '</div>' +
      '<div class="cart-item-info">' +
      '<div class="cart-item-name">' + item.name + '</div>' +
      '<div class="cart-item-weight">' + item.weight + '</div>' +
      '<div class="cart-item-price">' +
      (item.price > 0 ? item.price + ' جنيه' : 'اتصل للسعر') +
      '</div>' +
      '</div>' +
      '<div class="cart-item-controls">' +
      '<div class="cart-qty-control">' +
      '<button class="cart-qty-btn" onclick="changeItemQty(\'' + item.cartId + '\', 1)">+</button>' +
      '<span class="cart-qty-num">' + item.qty + '</span>' +
      '<button class="cart-qty-btn" onclick="changeItemQty(\'' + item.cartId + '\', -1)">-</button>' +
      '</div>' +
      '<div class="cart-item-total">' +
      (item.price > 0 ? itemTotal + ' جنيه' : '-') +
      '</div>' +
      '<button class="cart-remove-btn" onclick="removeItem(\'' + item.cartId + '\')">' +
      '<i class="fas fa-trash"></i>' +
      '</button>' +
      '</div>';

    cartItemsEl.appendChild(div);
  }
}

function openCartSidebar() {
  document.getElementById('cartSidebar').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function toggleCart() {
  var sidebar = document.getElementById('cartSidebar');
  if (sidebar.classList.contains('hidden')) {
    sidebar.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } else {
    sidebar.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// ===== CHECKOUT =====
function openCheckout() {
  if (cart.length === 0) { showToast('⚠️ السلة فارغة!'); return; }

  document.getElementById('cartSidebar').classList.add('hidden');
  document.getElementById('checkoutModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // ملخص الطلب
  var summary = document.getElementById('checkoutSummary');
  var total = 0;
  var html = '';

  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    var itemTotal = item.price * item.qty;
    total += itemTotal;
    html +=
      '<div class="checkout-item-row">' +
      '<span class="checkout-item-name">' + item.name + ' (' + item.weight + ')</span>' +
      '<span class="checkout-item-qty">× ' + item.qty + '</span>' +
      '<span class="checkout-item-price">' +
      (item.price > 0 ? itemTotal + ' جنيه' : 'اتصل') +
      '</span>' +
      '</div>';
  }

  summary.innerHTML = html;
  document.getElementById('checkoutTotal').textContent = total + ' جنيه';
  updateCheckoutWhatsapp();
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function updateCheckoutWhatsapp() {
  var name = document.getElementById('checkoutName') ? document.getElementById('checkoutName').value : '';
  var phone = document.getElementById('checkoutPhone') ? document.getElementById('checkoutPhone').value : '';
  var address = document.getElementById('checkoutAddress') ? document.getElementById('checkoutAddress').value : '';
  var notes = document.getElementById('checkoutNotes') ? document.getElementById('checkoutNotes').value : '';

  var total = 0;
  var productsList = '';

  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    var itemTotal = item.price * item.qty;
    total += itemTotal;
    productsList += '▪️ ' + item.name + ' (' + item.weight + ') × ' + item.qty + ' = ' +
      (item.price > 0 ? itemTotal + ' جنيه' : 'اتصل') + '\n';
  }

  var message =
    '🍵 *طلب جديد - شاي أصيل*\n\n' +
    '📦 *المنتجات:*\n' + productsList + '\n' +
    '━━━━━━━━━━━━━━━\n' +
    '💵 *الإجمالي: ' + total + ' جنيه*\n' +
    '━━━━━━━━━━━━━━━\n' +
    '👤 الاسم: ' + (name || '...') + '\n' +
    '📞 الهاتف: ' + (phone || '...') + '\n' +
    '📍 العنوان: ' + (address || '...') + '\n' +
    (notes ? '📝 ملاحظات: ' + notes : '');

  // ⬇️ غير الرقم لرقمك
  var whatsappPhone = '201000000000';
  var link = document.getElementById('checkoutWhatsapp');
  if (link) link.href = 'https://wa.me/' + whatsappPhone + '?text=' + encodeURIComponent(message);
}

document.getElementById('checkoutName') && document.getElementById('checkoutName').addEventListener('input', updateCheckoutWhatsapp);
document.getElementById('checkoutPhone') && document.getElementById('checkoutPhone').addEventListener('input', updateCheckoutWhatsapp);
document.getElementById('checkoutAddress') && document.getElementById('checkoutAddress').addEventListener('input', updateCheckoutWhatsapp);
document.getElementById('checkoutNotes') && document.getElementById('checkoutNotes').addEventListener('input', updateCheckoutWhatsapp);

document.getElementById('checkoutForm') && document.getElementById('checkoutForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var name = document.getElementById('checkoutName').value.trim();
  var phone = document.getElementById('checkoutPhone').value.trim();
  var address = document.getElementById('checkoutAddress').value.trim();
  if (!name || !phone || !address) { showToast('⚠️ يرجى ملء جميع الحقول'); return; }
  if (!/^01[0125][0-9]{8}$/.test(phone)) { showToast('⚠️ رقم الهاتف غير صحيح'); return; }
  updateCheckoutWhatsapp();
  showToast('✅ جاري فتح واتساب...');
  setTimeout(function () { document.getElementById('checkoutWhatsapp').click(); }, 500);
  setTimeout(function () { closeCheckout(); clearCart(); document.getElementById('checkoutForm').reset(); }, 2000);
});

// ===== WHOLESALE =====
function openWholesaleForm() { document.getElementById('wholesaleModal').classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function closeWholesaleForm() { document.getElementById('wholesaleModal').classList.add('hidden'); document.body.style.overflow = ''; }
document.getElementById('wholesaleForm') && document.getElementById('wholesaleForm').addEventListener('submit', function (e) { e.preventDefault(); showToast('✅ تم إرسال طلب الجملة!'); closeWholesaleForm(); e.target.reset(); });
document.getElementById('contactForm') && document.getElementById('contactForm').addEventListener('submit', function (e) { e.preventDefault(); showToast('✅ تم إرسال رسالتك!'); e.target.reset(); });

// ===== TOAST =====
function showToast(message) {
  var toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  setTimeout(function () {
    toast.classList.remove('show');
    setTimeout(function () { toast.classList.add('hidden'); }, 400);
  }, 4000);
}

// ===== LOADER =====
window.addEventListener('load', function () {
  document.body.style.overflow = 'hidden';

  var firstBtn = document.querySelector('.weight-btn');
  if (firstBtn) selectKarakWeight(firstBtn);

  var loader = document.getElementById('loader');
  setTimeout(function () {
    loader.classList.add('fade-out');
    setTimeout(function () {
      loader.style.display = 'none';
      document.body.style.overflow = '';
    }, 800);
  }, 2200);
});

// ===== NAVBAR =====
var navbar = document.getElementById('navbar');
var hamburger = document.getElementById('hamburger');
var navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', function () {
  if (window.scrollY > 80) {
    navbar.classList.add('scrolled');
    document.getElementById('scrollTop').classList.add('visible');
  } else {
    navbar.classList.remove('scrolled');
    document.getElementById('scrollTop').classList.remove('visible');
  }
});

hamburger.addEventListener('click', function () {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

var navLinkItems = navLinks.querySelectorAll('a');
for (var ni = 0; ni < navLinkItems.length; ni++) {
  navLinkItems[ni].addEventListener('click', function () {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
}

// ===== SLIDER =====
var slides = document.querySelectorAll('.slide');
var dots = document.querySelectorAll('.dot');
var currentSlide = 0;
var sliderInterval;

function goToSlide(index) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function startSlider() { sliderInterval = setInterval(function () { goToSlide(currentSlide + 1); }, 5000); }
function resetSlider() { clearInterval(sliderInterval); startSlider(); }

document.getElementById('nextBtn').addEventListener('click', function () { goToSlide(currentSlide + 1); resetSlider(); });
document.getElementById('prevBtn').addEventListener('click', function () { goToSlide(currentSlide - 1); resetSlider(); });

for (var di = 0; di < dots.length; di++) {
  (function (i) { dots[i].addEventListener('click', function () { goToSlide(i); resetSlider(); }); })(di);
}

var touchStartX = 0;
document.querySelector('.hero-slider').addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
document.querySelector('.hero-slider').addEventListener('touchend', function (e) {
  var diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) { goToSlide(currentSlide + (diff > 0 ? 1 : -1)); resetSlider(); }
});

startSlider();

// ===== SCROLL TOP =====
document.getElementById('scrollTop').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

// ===== ANIMATIONS =====
var animObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.15 });

var animEls = document.querySelectorAll('.product-card, .w-feature, .contact-item, .gallery-item, .section-header');
for (var ai = 0; ai < animEls.length; ai++) {
  animEls[ai].classList.add('fade-up');
  animObserver.observe(animEls[ai]);
}

// ===== COUNTER =====
function animateCounter(el) {
  var target = parseInt(el.getAttribute('data-target'));
  var current = 0;
  var step = target / (2000 / 16);
  var timer = setInterval(function () {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString('ar-EG');
    if (current >= target) clearInterval(timer);
  }, 16);
}

var statsObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      var nums = entry.target.querySelectorAll('.stat-num');
      for (var i = 0; i < nums.length; i++) animateCounter(nums[i]);
      statsObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

var aboutStats = document.querySelector('.about-stats');
if (aboutStats) statsObs.observe(aboutStats);

// ===== SMOOTH SCROLL =====
var scrollLinks = document.querySelectorAll('a[href^="#"]');
for (var si = 0; si < scrollLinks.length; si++) {
  scrollLinks[si].addEventListener('click', function (e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (target) { e.preventDefault(); window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' }); }
  });
}

console.log('🍵 شاي أصيل | تم تحميل الموقع بنجاح');