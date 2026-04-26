'use strict';

// ===================================================
// ===== DISCOUNT SYSTEM =====
// ===================================================

function calcDiscountedPrice(originalPrice, discount, type) {
  if (!discount || discount <= 0) return originalPrice;
  if (type === 'percent') return Math.round(originalPrice - (originalPrice * discount / 100));
  if (type === 'fixed') return Math.max(0, originalPrice - discount);
  return originalPrice;
}

function getDiscountLabel(discount, type) {
  if (!discount || discount <= 0) return '';
  if (type === 'percent') return `خصم ${discount}%`;
  if (type === 'fixed') return `خصم ${discount} جنيه`;
  return '';
}

function applyAllDiscounts() {
  document.querySelectorAll('.product-card[data-price]').forEach(card => {
    const originalPrice = parseFloat(card.dataset.price);
    const discount = parseFloat(card.dataset.discount) || 0;
    const type = card.dataset.discountType || 'percent';

    const discountBadge = card.querySelector('.discount-badge');
    const priceEl = card.querySelector('.card-price');
    const oldPriceEl = card.querySelector('.card-price-old');

    if (!originalPrice || originalPrice <= 0) {
      card.dataset.finalPrice = originalPrice;
      return;
    }

    if (discount > 0) {
      if (discountBadge) {
        discountBadge.textContent = getDiscountLabel(discount, type);
        discountBadge.classList.remove('hidden');
      }
      const newPrice = calcDiscountedPrice(originalPrice, discount, type);
      if (oldPriceEl) oldPriceEl.textContent = `${originalPrice} جنيه`;
      if (priceEl) priceEl.textContent = `${newPrice} جنيه`;
      card.dataset.finalPrice = newPrice;
    } else {
      if (discountBadge) discountBadge.classList.add('hidden');
      if (oldPriceEl) oldPriceEl.textContent = '';
      card.dataset.finalPrice = originalPrice;
    }
  });
}

// ===================================================
// ===== KARAK BY WEIGHT =====
// ===================================================

function selectKarakWeight(btn) {
  const card = btn.closest('.product-card');
  if (!card) return;

  // شيل active من كل الأزرار
  card.querySelectorAll('.weight-btn').forEach(b => b.classList.remove('active'));
  // حط active على الزرار اللي اتداس عليه
  btn.classList.add('active');

  const basePrice = parseFloat(card.dataset.basePrice);
  const grams = parseFloat(btn.dataset.grams);
  const discount = parseFloat(card.dataset.discount) || 0;
  const discountType = card.dataset.discountType;

  // احسب السعر الأصلي للوزن
  const originalWeightPrice = Math.round((basePrice / 1000) * grams);
  // احسب السعر بعد الخصم
  const finalPrice = calcDiscountedPrice(originalWeightPrice, discount, discountType);

  // حدث الواجهة
  const priceEl = card.querySelector('.card-price');
  const oldPriceEl = card.querySelector('.card-price-old');

  if (discount > 0) {
    oldPriceEl.textContent = `${originalWeightPrice} جنيه`;
    priceEl.textContent = `${finalPrice} جنيه`;
  } else {
    oldPriceEl.textContent = '';
    priceEl.textContent = `${finalPrice} جنيه`;
  }

  // خزن البيانات عشان السلة
  card.dataset.selectedWeight = btn.dataset.label;
  card.dataset.selectedGrams = grams;
  card.dataset.finalPrice = finalPrice;
  card.dataset.originalWeightPrice = originalWeightPrice;
}

function initializeKarakCards() {
  document.querySelectorAll('.product-card[data-base-price]').forEach(card => {
    const firstBtn = card.querySelector('.weight-btn');
    if (firstBtn) {
      selectKarakWeight(firstBtn);
    }
    applyAllDiscounts(); // تطبيق الخصومات على كروت الكرك بعد تحديد الوزن
  });
}


// ===================================================
// ===== PAGE LOAD =====
// ===================================================
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  document.body.style.overflow = 'hidden';

  // جهز كل كروت المنتجات
  applyAllDiscounts();
  initializeKarakCards();

  setTimeout(() => {
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.style.display = 'none';
      document.body.style.overflow = '';
    }, 800);
  }, 2200);
});

// ===================================================
// ===== NAVBAR, SLIDER, SCROLL, ETC. (No changes needed) =====
// ===================================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
window.addEventListener('scroll', () => { if (window.scrollY > 80) { navbar.classList.add('scrolled'); document.getElementById('scrollTop').classList.add('visible'); } else { navbar.classList.remove('scrolled'); document.getElementById('scrollTop').classList.remove('visible'); } });
hamburger.addEventListener('click', () => { hamburger.classList.toggle('active'); navLinks.classList.toggle('open'); });
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { hamburger.classList.remove('active'); navLinks.classList.remove('open'); }));
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;
let sliderInterval;
function goToSlide(index) { slides[currentSlide].classList.remove('active'); dots[currentSlide].classList.remove('active'); currentSlide = (index + slides.length) % slides.length; slides[currentSlide].classList.add('active'); dots[currentSlide].classList.add('active'); }
function startSlider() { sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 5000); }
function resetSlider() { clearInterval(sliderInterval); startSlider(); }
document.getElementById('nextBtn').addEventListener('click', () => { goToSlide(currentSlide + 1); resetSlider(); });
document.getElementById('prevBtn').addEventListener('click', () => { goToSlide(currentSlide - 1); resetSlider(); });
dots.forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); resetSlider(); }));
let touchStartX = 0;
document.querySelector('.hero-slider').addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
document.querySelector('.hero-slider').addEventListener('touchend', e => { const diff = touchStartX - e.changedTouches[0].clientX; if (Math.abs(diff) > 50) { goToSlide(currentSlide + (diff > 0 ? 1 : -1)); resetSlider(); } });
startSlider();
document.getElementById('scrollTop').addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); }); }, { threshold: 0.15 });
document.querySelectorAll('.product-card, .w-feature, .about-content, .contact-item, .gallery-item, .section-header').forEach(el => { el.classList.add('fade-up'); observer.observe(el); });
function animateCounter(el) { const target = parseInt(el.getAttribute('data-target')); let current = 0; const step = target / (2000 / 16); const timer = setInterval(() => { current = Math.min(current + step, target); el.textContent = Math.floor(current).toLocaleString('ar-EG'); if (current >= target) clearInterval(timer); }, 16); }
const statsObserver = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.querySelectorAll('.stat-num').forEach(animateCounter); statsObserver.unobserve(entry.target); } }); }, { threshold: 0.5 });
const aboutStats = document.querySelector('.about-stats');
if (aboutStats) statsObserver.observe(aboutStats);

// ===================================================
// ===== CART SYSTEM (UPDATED) =====
// ===================================================
let cart = [];

function addToCart(card) {
  const name = card.dataset.name;
  const category = card.dataset.category;
  const discount = parseFloat(card.dataset.discount) || 0;
  const discountType = card.dataset.discountType || 'percent';

  // تحديد الوزن والسعر بناءً على نوع الكارت
  let weight, finalPrice, originalPrice;
  if (card.dataset.basePrice) { // كارت الكرك بالأوزان
    weight = card.dataset.selectedWeight;
    finalPrice = parseFloat(card.dataset.finalPrice);
    originalPrice = parseFloat(card.dataset.originalWeightPrice);
  } else { // الكروت العادية
    weight = card.dataset.weight;
    finalPrice = parseFloat(card.dataset.finalPrice);
    originalPrice = parseFloat(card.dataset.price);
  }

  const existing = cart.find(item => item.name === name && item.weight === weight);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: Date.now(),
      name,
      weight,
      originalPrice,
      price: finalPrice,
      discount,
      discountType,
      category,
      qty: 1
    });
  }

  updateCartUI();
  showToast(`✅ تم إضافة "${name} - ${weight}" للسلة`);
  document.getElementById('cartSidebar').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}


function updateCartUI() {
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartFooterEl = document.getElementById('cartFooter');
  const cartCountEl = document.getElementById('cartCount');
  const cartTotalPriceEl = document.getElementById('cartTotalPrice');

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountEl.textContent = totalQty;
  cartCountEl.classList.remove('bump');
  void cartCountEl.offsetWidth;
  cartCountEl.classList.add('bump');

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  cartTotalPriceEl.textContent = `${total} جنيه`;

  if (cart.length === 0) {
    cartEmptyEl.style.display = 'block';
    cartFooterEl.style.display = 'none';
    cartItemsEl.innerHTML = '';
    cartItemsEl.appendChild(cartEmptyEl);
    return;
  }

  cartEmptyEl.style.display = 'none';
  cartFooterEl.style.display = 'block';
  cartItemsEl.innerHTML = '';

  cart.forEach(item => {
    const hasDiscount = item.discount > 0;
    const discountLabel = hasDiscount ? getDiscountLabel(item.discount, item.discountType) : '';
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
            <div class="cart-item-icon ${item.category === 'karak' ? 'karak' : ''}"><i class="fas fa-mug-hot"></i></div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-weight">${item.weight}</div>
                <div class="cart-item-price-wrap">
                    ${hasDiscount ? `<span class="cart-old-price">${item.originalPrice} جنيه</span>` : ''}
                    <span class="cart-item-price">${item.price > 0 ? item.price + ' جنيه' : 'اتصل'}</span>
                    ${hasDiscount ? `<span class="cart-discount-tag">${discountLabel}</span>` : ''}
                </div>
            </div>
            <div class="cart-item-controls">
                <div class="cart-qty-control">
                    <button class="cart-qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
                    <span class="cart-qty-num">${item.qty}</span>
                    <button class="cart-qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
                </div>
                <div class="cart-item-total">${item.price > 0 ? (item.price * item.qty) + ' جنيه' : '-'}</div>
                <button class="cart-remove-btn" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
    cartItemsEl.appendChild(itemEl);
  });
}


function updateCartQty(id, delta) { const item = cart.find(i => i.id === id); if (!item) return; item.qty = Math.max(1, item.qty + delta); updateCartUI(); }
function removeFromCart(id) { cart = cart.filter(i => i.id !== id); updateCartUI(); showToast('🗑️ تم حذف المنتج من السلة'); }
function clearCart() { cart = []; updateCartUI(); showToast('🗑️ تم إفراغ السلة'); }
function toggleCart() { const sidebar = document.getElementById('cartSidebar'); if (sidebar.classList.contains('hidden')) { sidebar.classList.remove('hidden'); document.body.style.overflow = 'hidden'; } else { sidebar.classList.add('hidden'); document.body.style.overflow = ''; } }


// ===================================================
// ===== CHECKOUT (No major changes needed) =====
// ===================================================
function openCheckout() { if (cart.length === 0) { showToast('⚠️ السلة فارغة!'); return; } document.getElementById('cartSidebar').classList.add('hidden'); document.getElementById('checkoutModal').classList.remove('hidden'); document.body.style.overflow = 'hidden'; renderCheckoutSummary(); updateCheckoutWhatsapp(); }
function closeCheckout() { document.getElementById('checkoutModal').classList.add('hidden'); document.body.style.overflow = ''; }
function renderCheckoutSummary() { const summary = document.getElementById('checkoutSummary'); const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0); summary.innerHTML = cart.map(item => `<div class="checkout-item-row"><span class="checkout-item-name">${item.name} (${item.weight})</span><span class="checkout-item-qty">× ${item.qty}</span><span class="checkout-item-price">${item.price > 0 ? (item.price * item.qty) + ' جنيه' : 'اتصل'}</span></div>${item.discount > 0 ? `<div class="checkout-saving-row"><span>💰 وفرت: ${getDiscountLabel(item.discount, item.discountType)}</span></div>` : ''}`).join(''); document.getElementById('checkoutTotal').textContent = `${total} جنيه`; }
function updateCheckoutWhatsapp() { const name = document.getElementById('checkoutName')?.value || ''; const phone = document.getElementById('checkoutPhone')?.value || ''; const address = document.getElementById('checkoutAddress')?.value || ''; const notes = document.getElementById('checkoutNotes')?.value || ''; const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0); const productsList = cart.map(item => { const discountInfo = item.discount > 0 ? ` (${getDiscountLabel(item.discount, item.discountType)})` : ''; return `▪️ ${item.name} (${item.weight})${discountInfo} × ${item.qty} = ${item.price > 0 ? item.price * item.qty + ' جنيه' : 'اتصل'}`; }).join('\n'); const message = encodeURIComponent(`🍵 *طلب جديد - شاي أصيل*\n\n📦 *المنتجات:*\n${productsList}\n\n━━━━━━━━━━━━━━━\n💵 *الإجمالي: ${total} جنيه*\n━━━━━━━━━━━━━━━\n👤 الاسم: ${name || '...'}\n📞 الهاتف: ${phone || '...'}\n📍 العنوان: ${address || '...'}\n${notes ? `📝 ملاحظات: ${notes}` : ''}`); const whatsappPhone = '201106055828'; const link = document.getElementById('checkoutWhatsapp'); if (link) link.href = `https://wa.me/${whatsappPhone}?text=${message}`; }
['checkoutName', 'checkoutPhone', 'checkoutAddress', 'checkoutNotes'].forEach(id => { document.getElementById(id)?.addEventListener('input', updateCheckoutWhatsapp); });
document.getElementById('checkoutForm')?.addEventListener('submit', e => { e.preventDefault(); const name = document.getElementById('checkoutName').value.trim(); const phone = document.getElementById('checkoutPhone').value.trim(); const address = document.getElementById('checkoutAddress').value.trim(); if (!name || !phone || !address) { showToast('⚠️ يرجى ملء جميع الحقول'); return; } if (!/^01[0125][0-9]{8}$/.test(phone)) { showToast('⚠️ رقم الهاتف غير صحيح'); return; } updateCheckoutWhatsapp(); showToast('✅ جاري فتح واتساب...'); setTimeout(() => { document.getElementById('checkoutWhatsapp').click(); }, 500); setTimeout(() => { closeCheckout(); clearCart(); document.getElementById('checkoutForm').reset(); }, 2000); });
function openWholesaleForm() { document.getElementById('wholesaleModal').classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function closeWholesaleForm() { document.getElementById('wholesaleModal').classList.add('hidden'); document.body.style.overflow = ''; }
document.getElementById('wholesaleForm')?.addEventListener('submit', e => { e.preventDefault(); showToast('✅ تم إرسال طلب الجملة!'); closeWholesaleForm(); e.target.reset(); });
document.getElementById('contactForm')?.addEventListener('submit', e => { e.preventDefault(); showToast('✅ تم إرسال رسالتك!'); e.target.reset(); });
function showToast(message) { const toast = document.getElementById('toast'); document.getElementById('toastMsg').textContent = message; toast.classList.remove('hidden'); void toast.offsetWidth; toast.classList.add('show'); setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.classList.add('hidden'), 400); }, 4000); }
document.querySelectorAll('a[href^="#"]').forEach(a => { a.addEventListener('click', e => { const target = document.querySelector(a.getAttribute('href')); if (target) { e.preventDefault(); window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' }); } }); });
console.log('🍵 شاي أصيل | تم تحميل الموقع بنجاح');