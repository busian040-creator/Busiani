(() => {
  const d = window.BUSIAN_DATA || { categories: [], merchants: [], products: [] };
  const app = document.getElementById("app");

  const safeStorageGet = (key, fallback = null) => {
    try { return localStorage.getItem(key) ?? fallback; } catch (error) { return fallback; }
  };

  const safeCart = () => {
    try {
      const raw = safeStorageGet("busian_cart", "[]");
      const parsed = JSON.parse(raw || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      try { localStorage.removeItem("busian_cart"); } catch (_) {}
      return [];
    }
  };

  const state = {
    category: "all",
    query: "",
    cart: safeCart(),
    role: safeStorageGet("busian_preview_role", "customer") || "customer",
    drawer: false
  };

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));

  const money = (price) => price == null ? "Price from merchant" : `KSh ${Number(price).toLocaleString("en-KE")}`;
  const productById = (id) => d.products.find((p) => p.id === id);
  const categoryById = (id) => d.categories.find((c) => c.id === id);
  const cartCount = () => state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartItems = () => state.cart.map((item) => ({ ...item, product: productById(item.productId) })).filter((item) => item.product);

  function persistCart() {
    try { localStorage.setItem("busian_cart", JSON.stringify(state.cart)); } catch (error) {}
    updateCartCount();
  }

  function updateCartCount() {
    const count = document.getElementById("cart-count");
    if (count) count.textContent = cartCount();
  }

  function setActiveNav(page) {
    document.querySelectorAll("[data-nav]").forEach((el) => el.classList.toggle("active", el.dataset.nav === page));
    document.querySelectorAll("[data-mobile-nav]").forEach((el) => el.classList.toggle("active", el.dataset.mobileNav === page));
  }

  function productMatches(p) {
    const selected = state.category === "all" || p.category.toLowerCase() === state.category;
    const text = `${p.name} ${p.category} ${p.merchant}`.toLowerCase();
    return selected && text.includes(state.query.toLowerCase());
  }

  function filteredProducts() {
    return d.products.filter(productMatches);
  }

  function categoryCards(limit = d.categories.length) {
    return d.categories.slice(0, limit).map((c) => `
      <button class="category-card" type="button" onclick="showCategory('${esc(c.id)}')">
        <span class="category-image-wrap"><img src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy"></span>
        <span class="category-card-body"><strong>${esc(c.name)}</strong><small>${esc(c.short)}</small></span>
      </button>`).join("");
  }

  function productCard(p) {
    return `
      <article class="product-card">
        <button class="product-image-button" type="button" onclick="openProduct('${esc(p.id)}')" aria-label="View ${esc(p.name)}">
          <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">
          <span class="wishlist-button" aria-hidden="true">♡</span>
        </button>
        <div class="product-info">
          <span class="product-category">${esc(p.category)}</span>
          <h3>${esc(p.name)}</h3>
          <button class="merchant-link" type="button" onclick="openStore('${esc(p.merchantId)}')">✓ ${esc(p.merchant)}</button>
          <div class="product-meta"><strong>${money(p.price)}</strong><span>★ ${esc(p.rating)}</span></div>
          <div class="product-actions">
            <button class="secondary small" type="button" onclick="openProduct('${esc(p.id)}')">View</button>
            <button class="primary small" type="button" onclick="addToCart('${esc(p.id)}')">Add to cart</button>
          </div>
        </div>
      </article>`;
  }

  function trustStrip() {
    return `<div class="trust-strip">
      <span>✓ Verified local merchants</span>
      <span>✓ Secure checkout</span>
      <span>✓ Tracked delivery</span>
      <span>✓ Local support</span>
    </div>`;
  }

  function renderHeaderSearch(value = state.query) {
    return `<div class="global-search-wrap">
      <span class="search-symbol">⌕</span>
      <input id="global-search" type="search" value="${esc(value)}" placeholder="Search products, stores and categories" autocomplete="off" oninput="searchFromHome(this.value)">
      <button type="button" onclick="show('shop')">Search</button>
    </div>`;
  }

  window.show = (page) => {
    closeDrawer();
    if (page === "shop") renderShop();
    else if (page === "stores") renderStores();
    else if (page === "orders") renderOrders();
    else if (page === "account") renderAccount();
    else if (page === "cart") renderCart();
    else if (page === "checkout") renderCheckout();
    else renderHome();
  };

  window.openDrawer = () => {
    state.drawer = true;
    document.getElementById("mobile-drawer")?.classList.add("open");
    document.getElementById("drawer-backdrop")?.classList.add("open");
    document.getElementById("mobile-drawer")?.setAttribute("aria-hidden", "false");
    renderDrawer();
  };

  window.closeDrawer = () => {
    state.drawer = false;
    document.getElementById("mobile-drawer")?.classList.remove("open");
    document.getElementById("drawer-backdrop")?.classList.remove("open");
    document.getElementById("mobile-drawer")?.setAttribute("aria-hidden", "true");
  };

  function renderDrawer() {
    const content = document.getElementById("drawer-content");
    if (!content) return;
    const role = state.role;
    if (role === "merchant") {
      content.innerHTML = `<div class="drawer-section"><h4>MY BUSINESS</h4>
        <button onclick="showWorkspace('merchant')">Dashboard</button><button onclick="showWorkspace('merchant','orders')">Orders</button><button onclick="showWorkspace('merchant','products')">Products</button><button onclick="showWorkspace('merchant','inventory')">Inventory</button><button onclick="showWorkspace('merchant','sales')">Sales & payments</button><button onclick="showWorkspace('merchant','profile')">Store profile</button></div>
        <div class="drawer-section"><h4>SUPPORT</h4><button onclick="show('account')">Account settings</button><button onclick="show('home')">Back to shopping</button></div>`;
    } else if (role === "rider") {
      content.innerHTML = `<div class="drawer-section"><h4>MY RIDER ACCOUNT</h4>
        <button onclick="showWorkspace('rider')">Dashboard</button><button onclick="showWorkspace('rider','deliveries')">Deliveries</button><button onclick="showWorkspace('rider','active')">Active delivery</button><button onclick="showWorkspace('rider','earnings')">Earnings</button><button onclick="showWorkspace('rider','profile')">Profile</button></div>
        <div class="drawer-section"><h4>SUPPORT</h4><button onclick="show('home')">Back to shopping</button></div>`;
    } else if (role === "admin") {
      content.innerHTML = `<div class="drawer-section"><h4>ADMIN</h4>
        <button onclick="showWorkspace('admin')">Dashboard</button><button onclick="showWorkspace('admin','users')">Users</button><button onclick="showWorkspace('admin','merchants')">Merchants</button><button onclick="showWorkspace('admin','orders')">Orders & deliveries</button><button onclick="showWorkspace('admin','payments')">Payments</button><button onclick="showWorkspace('admin','verification')">Verification</button><button onclick="showWorkspace('admin','commissions')">Commissions</button></div>`;
    } else {
      content.innerHTML = `<div class="drawer-section"><h4>MY BUSIAN</h4>
        <button onclick="show('account')">♙ My Account</button><button onclick="show('orders')">▣ Orders</button><button onclick="show('wishlist')">♡ Wishlist</button><button onclick="show('notifications')">◌ Notifications</button></div>
        <div class="drawer-section"><div class="drawer-section-title"><h4>SHOP</h4><button class="see-all-button" onclick="show('shop')">See all</button></div>
          <button onclick="show('stores')">Stores</button><button onclick="show('shop')">All products</button>${d.categories.slice(0,6).map(c => `<button onclick="showCategory('${esc(c.id)}')">${esc(c.icon)} ${esc(c.name)}</button>`).join("")}</div>
        <div class="drawer-section"><h4>JOIN BUSIAN</h4><button onclick="roles('merchant')">🏪 Become a Merchant</button><button onclick="roles('rider')">🛵 Become a Rider</button><button onclick="roles('agent')">◉ Become a Field Agent</button></div>
        <div class="drawer-section"><h4>HELP & SUPPORT</h4><button onclick="show('help')">Help Centre</button><button onclick="show('help')">Contact BUSIAN</button></div>`;
    }
  }

  window.searchFromHome = (value) => {
    state.query = value;
    if (value.trim().length >= 2) renderShop();
  };

  window.showCategory = (category) => {
    state.category = category;
    state.query = "";
    renderShop();
  };

  window.filterProducts = (value) => {
    state.query = value;
    renderShop(false);
    const input = document.getElementById("shop-search");
    if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  };

  window.openProduct = (id) => {
    const p = productById(id);
    if (!p) return;
    setActiveNav("shop");
    app.innerHTML = `<section class="page-shell">
      <button class="back-button" type="button" onclick="show('shop')">← Back to shop</button>
      <div class="product-detail">
        <div class="detail-image"><img src="${esc(p.image)}" alt="${esc(p.name)}"></div>
        <div class="detail-content">
          <span class="eyebrow">${esc(p.category)}</span><h1>${esc(p.name)}</h1>
          <button class="merchant-link large" type="button" onclick="openStore('${esc(p.merchantId)}')">✓ ${esc(p.merchant)}</button>
          <div class="detail-rating">★ ${esc(p.rating)} · ${p.available ? "Available" : "Currently unavailable"}</div>
          <h2>${money(p.price)}</h2>
          <p class="muted">Live merchant pricing, stock and delivery estimates will come from BUSIAN's backend after Supabase connection.</p>
          <div class="detail-actions"><button class="primary" type="button" onclick="addToCart('${esc(p.id)}')">Add to cart</button><button class="secondary" type="button" onclick="openStore('${esc(p.merchantId)}')">Visit store</button></div>
          <div class="trust-card"><strong>BUSIAN trust</strong><span>✓ Verified merchant</span><span>✓ Secure checkout</span><span>✓ Tracked delivery</span></div>
        </div>
      </div>
    </section>`;
  };

  window.addToCart = (id) => {
    const p = productById(id);
    if (!p) return;
    const existing = state.cart.find((item) => item.productId === id);
    if (existing) existing.quantity += 1;
    else state.cart.push({ productId: id, quantity: 1 });
    persistCart();
    toast(`${p.name} added to your cart.`);
  };

  window.changeCartQuantity = (id, change) => {
    const item = state.cart.find((entry) => entry.productId === id);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) state.cart = state.cart.filter((entry) => entry.productId !== id);
    persistCart();
    renderCart();
  };

  window.removeFromCart = (id) => {
    state.cart = state.cart.filter((entry) => entry.productId !== id);
    persistCart();
    renderCart();
  };

  window.openStore = (merchantId) => {
    const merchant = d.merchants.find((m) => m.id === merchantId);
    if (!merchant) return;
    const products = d.products.filter((p) => p.merchantId === merchantId);
    app.innerHTML = `<section class="page-shell">
      <button class="back-button" type="button" onclick="show('stores')">← Back to stores</button>
      <div class="store-hero"><div class="store-avatar">${esc(merchant.name.charAt(0))}</div><div><span class="eyebrow">LOCAL STORE</span><h1>${esc(merchant.name)}</h1><p>📍 ${esc(merchant.location)} · ${esc(merchant.category)}</p><span class="verified-badge">✓ Verified merchant</span></div></div>
      <div class="section-heading-row"><div><span class="eyebrow">STORE CATALOGUE</span><h2>${products.length} products</h2></div></div>
      <div class="product-grid">${products.map(productCard).join("")}</div>
    </section>`;
  };

  window.roles = (requestedRole = "") => {
    const roles = [
      { id: "customer", title: "Customer", icon: "♙", text: "Discover local products, place orders and track delivery." },
      { id: "merchant", title: "Merchant", icon: "🏪", text: "List products, receive orders and grow your local business." },
      { id: "rider", title: "Rider", icon: "🛵", text: "Accept delivery jobs, complete deliveries and track earnings." },
      { id: "agent", title: "Field Agent", icon: "◉", text: "Help local merchants join BUSIAN and manage onboarding." }
    ];
    app.innerHTML = `<section class="page-shell role-page"><div class="section-heading"><span class="eyebrow">JOIN BUSIAN</span><h1>Choose your BUSIAN role.</h1><p>One account can support approved roles. The next stage will connect these roles to Supabase authentication and permissions.</p></div><div class="role-grid">${roles.map(r => `<button class="role-card" type="button" onclick="selectRole('${r.id}')"><span class="role-icon">${r.icon}</span><strong>${r.title}</strong><span>${r.text}</span><b>Continue →</b></button>`).join("")}</div></section>`;
    if (requestedRole) toast(`Choose ${requestedRole} to continue.`);
  };

  window.selectRole = (role) => {
    state.role = role;
    localStorage.setItem("busian_preview_role", role);
    if (role === "merchant" || role === "rider" || role === "admin") showWorkspace(role);
    else renderAccount();
  };

  window.showWorkspace = (role = state.role, section = "dashboard") => {
    state.role = role;
    localStorage.setItem("busian_preview_role", role);
    closeDrawer();
    if (role === "merchant") renderMerchant(section);
    else if (role === "rider") renderRider(section);
    else if (role === "admin") renderAdmin(section);
    else renderAccount();
  };

  function renderHome() {
    state.category = "all"; state.query = "";
    setActiveNav("home");
    const featured = d.products.slice(0, 6);
    app.innerHTML = `<section class="home-page">
      <div class="home-topline"><span>📍 Delivering in <strong>${esc(d.location.name)}</strong></span><button type="button" onclick="show('stores')">Explore local stores →</button></div>
      ${renderHeaderSearch()}
      <section class="hero-market">
        <div class="hero-market-copy"><span class="eyebrow">BUSIAN LOCAL COMMERCE</span><h1>Find it locally.<br><span>Get it delivered.</span></h1><p>Discover products from local businesses in Busia and connect to the people who make delivery possible.</p><div class="hero-actions"><button class="primary" onclick="show('shop')">Start shopping</button><button class="secondary" onclick="show('stores')">Browse stores</button></div></div>
        <div class="hero-market-side"><span class="hero-round-icon"><img src="Assets/file_00000000b86c820bb3cd5718c5a5cd39.png" alt="BUSIAN"></span><strong>Local businesses.<br>One connected marketplace.</strong><small>Merchant → BUSIAN → Rider → Customer</small></div>
      </section>
      ${trustStrip()}
      <section class="section-shell"><div class="section-heading-row"><div><span class="eyebrow">EXPLORE</span><h2>Shop by category</h2></div><button class="text-button" onclick="show('shop')">See all →</button></div><div class="category-grid">${categoryCards(8)}</div></section>
      <section class="section-shell"><div class="section-heading-row"><div><span class="eyebrow">LOCAL DISCOVERY</span><h2>Popular near you</h2></div><button class="text-button" onclick="show('shop')">View all →</button></div><div class="product-grid">${featured.map(productCard).join("")}</div></section>
      <section class="local-commerce-card"><div><span class="eyebrow">GROW WITH BUSIAN</span><h2>Do you run a local business?</h2><p>Put your products in front of nearby customers and let BUSIAN help coordinate orders and delivery.</p></div><button class="primary" onclick="roles('merchant')">Become a merchant</button></section>
    </section>`;
  }

  function renderShop() {
    setActiveNav("shop");
    const ps = filteredProducts();
    app.innerHTML = `<section class="page-shell"><div class="section-heading"><span class="eyebrow">BUSIAN MARKETPLACE</span><h1>Shop local.</h1><p>Search products and stores available through BUSIAN.</p></div><div class="shop-tools"><div class="shop-search"><span>⌕</span><input id="shop-search" type="search" placeholder="Search products or businesses..." value="${esc(state.query)}" oninput="filterProducts(this.value)"></div><select onchange="showCategory(this.value)"><option value="all">All categories</option>${d.categories.map(c => `<option value="${esc(c.id)}" ${state.category === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></div><div class="category-pills"><button class="${state.category === "all" ? "active" : ""}" onclick="showCategory('all')">All</button>${d.categories.map(c => `<button class="${state.category === c.id ? "active" : ""}" onclick="showCategory('${esc(c.id)}')">${esc(c.name)}</button>`).join("")}</div><div class="product-grid">${ps.length ? ps.map(productCard).join("") : `<div class="empty-state"><strong>No matching products.</strong><p>Try another category or search term.</p></div>`}</div></section>`;
  }

  function renderStores() {
    setActiveNav("stores");
    app.innerHTML = `<section class="page-shell"><div class="section-heading"><span class="eyebrow">LOCAL BUSINESSES</span><h1>Stores near you.</h1><p>Explore verified businesses and the products they offer through BUSIAN.</p></div><div class="store-grid">${d.merchants.map(m => `<article class="store-card"><div class="store-avatar">${esc(m.name.charAt(0))}</div><div><span class="verified-badge">✓ Verified</span><h3>${esc(m.name)}</h3><p>${esc(m.category)} · 📍 ${esc(m.location)}</p><small>${m.products} products</small></div><button class="secondary small" onclick="openStore('${esc(m.id)}')">Visit store</button></article>`).join("")}</div></section>`;
  }

  function renderOrders() {
    setActiveNav("orders");
    app.innerHTML = `<section class="page-shell"><div class="section-heading"><span class="eyebrow">MY ORDERS</span><h1>Track your BUSIAN orders.</h1><p>Your real orders, payments and delivery updates will appear here after authentication is connected.</p></div><div class="order-preview-card"><div class="order-head"><div><strong>Order tracking</strong><small>Ready for Supabase order lifecycle</small></div><span class="status-pill">No active orders</span></div><div class="order-steps"><span class="done">1<br><small>Placed</small></span><span>2<br><small>Paid</small></span><span>3<br><small>Preparing</small></span><span>4<br><small>Rider</small></span><span>5<br><small>Delivered</small></span></div><button class="primary" onclick="show('shop')">Continue shopping</button></div></section>`;
  }

  function renderAccount() {
    setActiveNav("account");
    const roleLabel = state.role === "customer" ? "Customer" : state.role.charAt(0).toUpperCase() + state.role.slice(1);
    app.innerHTML = `<section class="page-shell account-page"><div class="account-hero"><span class="account-avatar">♙</span><div><span class="eyebrow">MY BUSIAN</span><h1>${roleLabel} account</h1><p>Authentication, saved addresses, payments and approved roles will be connected through Supabase next.</p></div></div><div class="account-grid"><button onclick="show('orders')"><strong>▣ Orders</strong><span>Track purchases and delivery</span></button><button onclick="show('cart')"><strong>🛒 Cart</strong><span>${cartCount()} item(s) waiting</span></button><button onclick="roles()"><strong>＋ Join another role</strong><span>Merchant, rider or field agent</span></button><button onclick="show('help')"><strong>◌ Help & support</strong><span>Get assistance from BUSIAN</span></button></div></section>`;
  }

  function renderCart() {
    const items = cartItems();
    const subtotal = items.reduce((sum, item) => sum + ((item.product.price || 0) * item.quantity), 0);
    app.innerHTML = `<section class="page-shell"><div class="section-heading"><span class="eyebrow">YOUR CART</span><h1>Ready when you are.</h1><p>Cart structure is prepared for the real checkout and M-Pesa payment flow.</p></div>${items.length ? `<div class="cart-layout"><div class="cart-list">${items.map(item => `<article class="cart-item"><img src="${esc(item.product.image)}" alt="${esc(item.product.name)}"><div class="cart-item-info"><strong>${esc(item.product.name)}</strong><button class="merchant-link" onclick="openStore('${esc(item.product.merchantId)}')">✓ ${esc(item.product.merchant)}</button><span>${money(item.product.price)}</span><div class="qty-controls"><button onclick="changeCartQuantity('${esc(item.product.id)}',-1)">−</button><b>${item.quantity}</b><button onclick="changeCartQuantity('${esc(item.product.id)}',1)">+</button><button class="remove-link" onclick="removeFromCart('${esc(item.product.id)}')">Remove</button></div></div></article>`).join("")}</div><aside class="checkout-summary"><span class="eyebrow">ORDER SUMMARY</span><div><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div><span>Delivery</span><strong>Calculated at checkout</strong></div><hr><div class="summary-total"><span>Total</span><strong>${money(subtotal)}</strong></div><button class="primary full" onclick="show('checkout')">Proceed to checkout</button></aside></div>` : `<div class="empty-state"><div class="empty-icon">🛒</div><h2>Your cart is empty</h2><p>Add products from local BUSIAN stores and they will appear here.</p><button class="primary" onclick="show('shop')">Browse products</button></div>`}</section>`;
  }

  function renderCheckout() {
    const items = cartItems();
    const subtotal = items.reduce((sum, item) => sum + ((item.product.price || 0) * item.quantity), 0);
    app.innerHTML = `<section class="page-shell"><button class="back-button" onclick="show('cart')">← Back to cart</button><div class="section-heading"><span class="eyebrow">CHECKOUT</span><h1>Complete your order.</h1><p>The interface is ready for the Supabase + M-Pesa transaction flow.</p></div><div class="checkout-layout"><div class="checkout-form"><section class="checkout-block"><h3>1. Delivery location</h3><label>Delivery area<input type="text" placeholder="Busia Town / estate / landmark"></label><label>Phone number<input type="tel" placeholder="07xx xxx xxx"></label><label>Delivery notes<textarea placeholder="Landmark or rider instructions"></textarea></label></section><section class="checkout-block"><h3>2. Payment</h3><button class="payment-method active" type="button"><span>🇰🇪</span><div><strong>M-Pesa</strong><small>Pay securely through M-Pesa STK</small></div><b>✓</b></button><p class="muted small-text">M-Pesa will be activated after the Supabase payment service is connected.</p></section></div><aside class="checkout-summary"><span class="eyebrow">YOUR ORDER</span>${items.map(i => `<div class="summary-line"><span>${esc(i.product.name)} × ${i.quantity}</span><strong>${money((i.product.price || 0) * i.quantity)}</strong></div>`).join("")}<hr><div class="summary-total"><span>Total</span><strong>${money(subtotal)}</strong></div><button class="primary full" onclick="paymentPlaceholder()">Continue to M-Pesa</button></aside></div></section>`;
  }

  window.paymentPlaceholder = () => toast("M-Pesa payment will be connected after Supabase setup.");

  function workspaceStat(label, value, hint) { return `<div class="stat-card"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(hint)}</small></div>`; }

  function renderMerchant(section) {
    app.innerHTML = `<section class="workspace-page"><div class="workspace-head"><div><span class="eyebrow">MERCHANT WORKSPACE</span><h1>Business dashboard</h1><p>Manage products, orders, inventory and sales from one place.</p></div><button class="secondary" onclick="roles('merchant')">Business verification</button></div><div class="stats-grid">${workspaceStat("Today's sales", "KSh —", "Live after Supabase")}${workspaceStat("Orders", "—", "Awaiting live data")}${workspaceStat("Products", "—", "Merchant catalogue")}${workspaceStat("Payout", "KSh —", "Settlement status")}</div><div class="workspace-grid"><aside class="workspace-sidebar"><button class="active" onclick="showWorkspace('merchant','dashboard')">Dashboard</button><button onclick="showWorkspace('merchant','orders')">Orders</button><button onclick="showWorkspace('merchant','products')">Products</button><button onclick="showWorkspace('merchant','inventory')">Inventory</button><button onclick="showWorkspace('merchant','sales')">Sales & payments</button><button onclick="showWorkspace('merchant','profile')">Store profile</button></aside><div class="workspace-content">${merchantSection(section)}</div></div></section>`;
  }

  function merchantSection(section) {
    if (section === "products") return `<div class="workspace-card"><div class="card-heading"><div><h2>Products</h2><p>Manage the products customers see.</p></div><button class="primary">+ Add product</button></div><div class="management-list">${d.products.slice(0,5).map(p => `<div><img src="${esc(p.image)}" alt=""><span><strong>${esc(p.name)}</strong><small>${esc(p.category)}</small></span><b>${money(p.price)}</b><button class="secondary small">Edit</button></div>`).join("")}</div></div>`;
    if (section === "orders") return `<div class="workspace-card"><div class="card-heading"><div><h2>Orders</h2><p>Order lifecycle: new → accepted → preparing → ready → delivered.</p></div></div><div class="empty-state compact"><h3>No live merchant orders yet</h3><p>Supabase will populate this view after connection.</p></div></div>`;
    if (section === "inventory") return `<div class="workspace-card"><h2>Inventory</h2><p class="muted">Stock levels, low-stock alerts and product availability will live here.</p><div class="feature-list"><span>✓ Stock quantity</span><span>✓ Low-stock alerts</span><span>✓ Product activation</span><span>✓ Merchant catalogue sync</span></div></div>`;
    if (section === "sales") return `<div class="workspace-card"><h2>Sales & payments</h2><p class="muted">Track gross sales, BUSIAN commission, delivery charges and merchant settlement.</p><div class="feature-list"><span>Revenue</span><span>Commission</span><span>Settlement status</span><span>Transaction history</span></div></div>`;
    if (section === "profile") return `<div class="workspace-card"><h2>Store profile</h2><p class="muted">Business information and verification documents will be securely managed here.</p><button class="primary">Complete business profile</button></div>`;
    return `<div class="workspace-card"><div class="card-heading"><div><h2>Welcome to your business workspace</h2><p>Your merchant control centre is ready for live data.</p></div><span class="verified-badge">Verification required</span></div><div class="feature-list"><span>✓ Receive customer orders</span><span>✓ Manage products and inventory</span><span>✓ Track sales and settlements</span><span>✓ View verification status</span></div></div>`;
  }

  function renderRider(section) {
    app.innerHTML = `<section class="workspace-page"><div class="workspace-head"><div><span class="eyebrow">RIDER WORKSPACE</span><h1>Delivery dashboard</h1><p>Accept jobs, manage active deliveries and track earnings.</p></div><span class="online-pill">● Available for work</span></div><div class="stats-grid">${workspaceStat("Available", "—", "Delivery jobs")}${workspaceStat("Active", "—", "Current delivery")}${workspaceStat("Today", "—", "Completed jobs")}${workspaceStat("Earnings", "KSh —", "Live after connection")}</div><div class="workspace-grid"><aside class="workspace-sidebar"><button class="active" onclick="showWorkspace('rider','dashboard')">Dashboard</button><button onclick="showWorkspace('rider','deliveries')">Deliveries</button><button onclick="showWorkspace('rider','active')">Active delivery</button><button onclick="showWorkspace('rider','earnings')">Earnings</button><button onclick="showWorkspace('rider','profile')">Profile</button></aside><div class="workspace-content">${riderSection(section)}</div></div></section>`;
  }

  function riderSection(section) {
    if (section === "deliveries") return `<div class="workspace-card"><h2>Available deliveries</h2><p class="muted">Paid orders that are ready for rider assignment will appear here.</p><div class="empty-state compact"><h3>No delivery jobs yet</h3><p>Live assignments will be powered by the order and delivery tables.</p></div></div>`;
    if (section === "active") return `<div class="workspace-card"><h2>Active delivery</h2><div class="order-steps large"><span class="done">1<br><small>Assigned</small></span><span>2<br><small>Picked up</small></span><span>3<br><small>Out for delivery</small></span><span>4<br><small>Delivered</small></span></div></div>`;
    if (section === "earnings") return `<div class="workspace-card"><h2>Earnings</h2><p class="muted">Rider earnings will be calculated from completed deliveries and BUSIAN's configurable commission rules.</p><div class="feature-list"><span>Delivery earnings</span><span>Completed deliveries</span><span>Settlement history</span></div></div>`;
    if (section === "profile") return `<div class="workspace-card"><h2>Rider profile</h2><p class="muted">Approval, service area, vehicle details and payout information will be stored securely.</p><button class="primary">Complete rider profile</button></div>`;
    return `<div class="workspace-card"><h2>Ready for deliveries</h2><p class="muted">The rider workflow is prepared for live assignment once orders and authentication are connected.</p><div class="feature-list"><span>✓ Accept delivery jobs</span><span>✓ Pickup confirmation</span><span>✓ Delivery status updates</span><span>✓ Earnings tracking</span></div></div>`;
  }

  function renderAdmin(section) {
    app.innerHTML = `<section class="workspace-page"><div class="workspace-head"><div><span class="eyebrow">BUSIAN OPERATIONS</span><h1>Admin control centre</h1><p>Monitor users, merchants, riders, orders, payments and platform rules.</p></div><span class="admin-pill">ADMIN</span></div><div class="stats-grid">${workspaceStat("Users", "—", "Customer + roles")}${workspaceStat("Merchants", "—", "Verification")}${workspaceStat("Orders", "—", "All order states")}${workspaceStat("Payments", "KSh —", "M-Pesa transactions")}</div><div class="workspace-grid"><aside class="workspace-sidebar"><button class="active" onclick="showWorkspace('admin')">Dashboard</button><button onclick="showWorkspace('admin','users')">Users</button><button onclick="showWorkspace('admin','merchants')">Merchants</button><button onclick="showWorkspace('admin','orders')">Orders & deliveries</button><button onclick="showWorkspace('admin','payments')">Payments</button><button onclick="showWorkspace('admin','verification')">Verification</button><button onclick="showWorkspace('admin','commissions')">Commissions</button></aside><div class="workspace-content">${adminSection(section)}</div></div></section>`;
  }

  function adminSection(section) {
    const map = { users: "User accounts and role approvals", merchants: "Merchant onboarding and verification", orders: "Orders, rider assignments and delivery lifecycle", payments: "M-Pesa transactions, payment status and reconciliation", verification: "Review merchant and rider verification records", commissions: "Configure BUSIAN, merchant and rider commission rules" };
    if (map[section]) return `<div class="workspace-card"><h2>${esc(map[section])}</h2><p class="muted">This management area is structurally ready. Supabase policies and server-side operations will provide the real records.</p><div class="feature-list"><span>✓ Role-based access</span><span>✓ Audit-friendly status changes</span><span>✓ Secure server operations</span></div></div>`;
    return `<div class="workspace-card"><h2>Platform overview</h2><p class="muted">The admin layer will control the operating system behind BUSIAN without exposing privileged actions to the public browser.</p><div class="feature-list"><span>✓ Users & roles</span><span>✓ Merchant verification</span><span>✓ Rider operations</span><span>✓ Orders & delivery</span><span>✓ Payments & reconciliation</span><span>✓ Commission rules</span></div></div>`;
  }

  window.toast = (message) => {
    let node = document.getElementById("busian-toast");
    if (!node) { node = document.createElement("div"); node.id = "busian-toast"; document.body.appendChild(node); }
    node.textContent = message; node.classList.add("show");
    clearTimeout(window.__busianToast); window.__busianToast = setTimeout(() => node.classList.remove("show"), 2400);
  };

  // Placeholder screens for navigation items that are intentionally not data-backed yet.
  window.showSpecial = (title, message) => {
    app.innerHTML = `<section class="page-shell centered"><span class="eyebrow">BUSIAN</span><h1>${esc(title)}</h1><p>${esc(message)}</p><button class="primary" onclick="show('home')">Back home</button></section>`;
  };

  window.show = new Proxy(window.show, {
    apply(target, thisArg, args) {
      const page = args[0];
      if (page === "wishlist") return showSpecial("Wishlist", "Saved products will be connected to your authenticated account.");
      if (page === "notifications") return showSpecial("Notifications", "Order, payment and delivery notifications will be powered by Supabase.");
      if (page === "help") return showSpecial("BUSIAN Support", "Support channels will be added as the platform services are connected.");
      return Reflect.apply(target, thisArg, args);
    }
  });

  try {
    renderHome();
    updateCartCount();
  } catch (error) {
    console.error("BUSIAN startup error:", error);
    if (app) {
      app.innerHTML = `<section class="page-shell centered"><span class="eyebrow">BUSIAN</span><h1>BUSIAN is loading</h1><p>We couldn't load the marketplace interface. Please refresh the page.</p><button class="primary" type="button" onclick="location.reload()">Refresh BUSIAN</button></section>`;
    }
  }
})();
