// ── Shared Qiah JS ── cart, wishlist, search ──────────────────────────────

// ── Cart State ────────────────────────────────────────────────────────────
function getCart() {
  try { return JSON.parse(localStorage.getItem('qiah-cart') || '[]'); } catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem('qiah-cart', JSON.stringify(cart));
}
function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = `Cart (${total})`);
}
function addToCart(name, price, size) {
  const cart = getCart();
  const key = name + '-' + size;
  const existing = cart.find(i => i.key === key);
  if (existing) { existing.qty++; } else { cart.push({ key, name, price, size, qty: 1 }); }
  saveCart(cart);
  updateCartCount();
  renderCartItems();
  openCart();
}
function removeFromCart(key) {
  let cart = getCart().filter(i => i.key !== key);
  saveCart(cart);
  updateCartCount();
  renderCartItems();
}
function changeQty(key, delta) {
  let cart = getCart();
  const item = cart.find(i => i.key === key);
  if (item) { item.qty += delta; if (item.qty <= 0) cart = cart.filter(i => i.key !== key); }
  saveCart(cart);
  updateCartCount();
  renderCartItems();
}
function renderCartItems() {
  const cart = getCart();
  const body = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');
  if (!body) return;
  if (cart.length === 0) {
    body.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    footer.style.display = 'none';
    return;
  }
  footer.style.display = 'block';
  let total = 0;
  body.innerHTML = cart.map(item => {
    const sub = item.price * item.qty;
    total += sub;
    return `<div class="cart-item">
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-size">Size: ${item.size}</span>
      </div>
      <div class="cart-item-controls">
        <button onclick="changeQty('${item.key}', -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty('${item.key}', 1)">+</button>
        <span class="cart-item-price">$${sub}</span>
        <button class="cart-remove" onclick="removeFromCart('${item.key}')">✕</button>
      </div>
    </div>`;
  }).join('');
  document.getElementById('cart-total').textContent = `$${total}`;
}
function openCart() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
}
function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

// ── Wishlist ──────────────────────────────────────────────────────────────
function getWishlist() {
  try { return JSON.parse(localStorage.getItem('qiah-wishlist') || '[]'); } catch { return []; }
}
function toggleWishlist(name, btn) {
  let wl = getWishlist();
  if (wl.includes(name)) {
    wl = wl.filter(n => n !== name);
    btn.classList.remove('wishlisted');
    btn.title = 'Save to wishlist';
  } else {
    wl.push(name);
    btn.classList.add('wishlisted');
    btn.title = 'Remove from wishlist';
  }
  localStorage.setItem('qiah-wishlist', JSON.stringify(wl));
}
function initWishlistButtons() {
  const wl = getWishlist();
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    if (wl.includes(btn.dataset.name)) {
      btn.classList.add('wishlisted');
      btn.title = 'Remove from wishlist';
    }
  });
}

// ── Search ────────────────────────────────────────────────────────────────
function openSearch() {
  document.getElementById('search-overlay').classList.add('open');
  setTimeout(() => document.getElementById('search-input').focus(), 100);
}
function closeSearch() {
  document.getElementById('search-overlay').classList.remove('open');
  document.getElementById('search-input').value = '';
  document.getElementById('search-results').innerHTML = '';
}

// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderCartItems();
  initWishlistButtons();

  // cart overlay close
  const co = document.getElementById('cart-overlay');
  if (co) co.addEventListener('click', closeCart);

  // search overlay close on backdrop click
  const so = document.getElementById('search-overlay');
  if (so) so.addEventListener('click', e => { if (e.target === so) closeSearch(); });

  // search input live filter
  const si = document.getElementById('search-input');
  if (si) {
    si.addEventListener('input', () => {
      const q = si.value.trim().toLowerCase();
      const results = document.getElementById('search-results');
      if (!q) { results.innerHTML = ''; return; }
      const all = [
        {name:'Grey Cord-Set', price:'$120', page:'summer.html'},
        {name:'Polka Dot Top', price:'$85', page:'summer.html'},
        {name:'Blue & White Bow Top', price:'$70', page:'summer.html'},
        {name:'Butter Yellow Top', price:'$95', page:'summer.html'},
        {name:'White Dress', price:'$75', page:'summer.html'},
        {name:'Top + Bottoms Set', price:'$90', page:'summer.html'},
        {name:'Chunky Knit Sweater', price:'$120', page:'winter.html'},
        {name:'Half Zipper Knit Pullover', price:'$180', page:'winter.html'},
        {name:'Cashmere Scarf', price:'$90', page:'winter.html'},
        {name:'Fleece Tops', price:'$200', page:'winter.html'},
        {name:'Classic Wool Coat', price:'$220', page:'winter.html'},
        {name:'Burgundy Knit Top', price:'$40', page:'winter.html'},
      ];
      const hits = all.filter(p => p.name.toLowerCase().includes(q));
      results.innerHTML = hits.length
        ? hits.map(p => `<a href="${p.page}" class="search-result-item"><span>${p.name}</span><span>${p.price}</span></a>`).join('')
        : '<p class="search-no-results">No pieces found.</p>';
    });
  }

  // keyboard ESC closes overlays
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCart(); closeSearch(); }
  });
});
