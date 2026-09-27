(() => {
  'use strict';

  const d = window.BUSIAN_DATA || { location: { name: 'Busia' }, categories: [], merchants: [], products: [] };
  const app = document.getElementById('app');
  const LOGO = 'Assets/file_00000000b86c820bb3cd5718c5a5cd39.png';

  const safeGet = (key, fallback = null) => { try { return localStorage.getItem(key) ?? fallback; } catch (_) { return fallback; } };
  const safeSet = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  const safeJSON = (key, fallback) => { try { const v = JSON.parse(safeGet(key, '')); return v ?? fallback; } catch (_) { return fallback; } };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const money = (v) => v == null || v === '' ? 'Price unavailable' : `KSh ${Number(v).toLocaleString('en-KE')}`;
  const productById = id => d.products.find(p => p.id === id);
  const merchantById = id => d.merchants.find(m => m.id === id);
  const categoryById = id => d.categories.find(c => c.id === id);
  const cartCount = () => state.cart.reduce((n, i) => n + i.quantity, 0);

  const icon = (name, label = '') => {
    const paths = {
      home:'<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>',
      search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
      cart:'<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
      menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
      close:'<path d="m6 6 12 12M18 6 6 18"/>',
      heart:'<path d="M20.8 8.6c0 5.4-8.8 10.2-8.8 10.2S3.2 14 3.2 8.6A4.6 4.6 0 0 1 12 6.3a4.6 4.6 0 0 1 8.8 2.3Z"/>',
      box:'<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7"/><path d="M12 11v10"/>',
      store:'<path d="M4 10v10h16V10"/><path d="M3 10 5 4h14l2 6"/><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M9 20v-5h6v5"/>',
      bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
      truck:'<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
      plus:'<path d="M12 5v14M5 12h14"/>',
      edit:'<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13 6 4 4"/>',
      check:'<path d="m5 12 4 4L19 6"/>',
      x:'<path d="m6 6 12 12M18 6 6 18"/>',
      wallet:'<path d="M3 6h17v14H3z"/><path d="M3 6V4h14v2"/><path d="M16 13h4"/>',
      shield:'<path d="m12 3 8 3v5c0 5-3.3 8.5-8 10-4.7-1.5-8-5-8-10V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
      location:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
      chevron:'<path d="m9 18 6-6-6-6"/>',
      arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
      filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
      star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>'
    };
    return `<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.box}</svg>${label ? `<span class="sr-only">${esc(label)}</span>` : ''}`;
  };

  const state = {
    category: 'all', query: '', cart: safeJSON('busian_cart', []), wishlist: safeJSON('busian_wishlist', []),
    role: safeGet('busian_preview_role', 'customer') || 'customer', drawer: false, lastFocus: null,
    drafts: safeJSON('busian_frontend_drafts', {}), fieldLeads: safeJSON('busian_field_leads', [])
  };

  function persistCart(){ safeSet('busian_cart', JSON.stringify(state.cart)); updateCartCount(); }
  function persistDrafts(){ safeSet('busian_frontend_drafts', JSON.stringify(state.drafts)); }
  function persistWishlist(){ safeSet('busian_wishlist', JSON.stringify(state.wishlist)); }
  function toast(message){ let t=document.getElementById('busian-toast'); if(!t){t=document.createElement('div');t.id='busian-toast';document.body.appendChild(t);} t.textContent=message;t.classList.add('show');clearTimeout(window.__busianToast);window.__busianToast=setTimeout(()=>t.classList.remove('show'),2300); }
  function updateCartCount(){ const el=document.getElementById('cart-count'); if(el) el.textContent=cartCount(); }
  function setActiveNav(page){ document.querySelectorAll('[data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav===page)); document.querySelectorAll('[data-mobile-nav]').forEach(x=>x.classList.toggle('active',x.dataset.mobileNav===page)); }
  function filteredProducts(){ return d.products.filter(p => { const cat=state.category==='all'||p.category.toLowerCase()===state.category; const q=`${p.name} ${p.category} ${p.merchant}`.toLowerCase(); return cat && q.includes(state.query.toLowerCase()); }); }
  function wishlistHas(id){ return state.wishlist.includes(id); }

  function productCard(p){
    const priced = p.price != null && p.price !== '';
    return `<article class="product-card">
      <div class="product-image-button" role="group" aria-label="${esc(p.name)}">
        <button class="wishlist-button ${wishlistHas(p.id)?'active':''}" type="button" onclick="toggleWishlist('${esc(p.id)}')" aria-label="${wishlistHas(p.id)?'Remove from wishlist':'Add to wishlist'}" title="${wishlistHas(p.id)?'Remove from wishlist':'Add to wishlist'}">${icon('heart')}</button>
        <button class="product-image-open" type="button" onclick="openProduct('${esc(p.id)}')" aria-label="View ${esc(p.name)}"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"></button>
      </div>
      <div class="product-info"><span class="product-category">${esc(p.category)}</span><h3>${esc(p.name)}</h3>
        <button class="merchant-link" type="button" onclick="openStore('${esc(p.merchantId)}')">${icon('shield')} ${esc(p.merchant)}</button>
        <div class="product-meta"><strong>${money(p.price)}</strong><span>${icon('star')} ${esc(p.rating)}</span></div>
        ${priced ? `<div class="product-actions"><button class="secondary small" type="button" onclick="openProduct('${esc(p.id)}')">View</button><button class="primary small" type="button" onclick="addToCart('${esc(p.id)}')">Add to cart</button></div>` : `<div class="product-actions"><button class="secondary small" type="button" onclick="openProduct('${esc(p.id)}')">View details</button><button class="primary small disabled-action" type="button" disabled title="Price will be supplied by the merchant">Price pending</button></div>`}
      </div></article>`;
  }

  function categoryCards(limit){ return d.categories.slice(0,limit||d.categories.length).map(c=>`<button class="category-card" type="button" onclick="showCategory('${esc(c.id)}')"><span class="category-image-wrap"><img src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy"></span><span class="category-card-body"><strong>${esc(c.name)}</strong><small>${esc(c.short)}</small></span></button>`).join(''); }
  function trustStrip(){ return `<div class="trust-strip"><span>${icon('shield')} Verified local merchants</span><span>${icon('wallet')} Secure checkout</span><span>${icon('truck')} Tracked delivery</span><span>${icon('user')} Local support</span></div>`; }
  function renderHeaderSearch(value=state.query){ return `<div class="global-search-wrap"><span class="search-symbol">${icon('search')}</span><input id="global-search" type="search" value="${esc(value)}" placeholder="Search products, stores and categories" autocomplete="off" aria-label="Search products, stores and categories" oninput="searchFromHome(this.value)"><button type="button" onclick="show('shop')">Search</button></div>`; }

  window.show = page => { closeDrawer(); if(page==='shop')renderShop();else if(page==='stores')renderStores();else if(page==='orders')renderOrders();else if(page==='account')renderAccount();else if(page==='cart')renderCart();else if(page==='checkout')renderCheckout();else if(page==='wishlist')renderWishlist();else if(page==='notifications')renderNotifications();else if(page==='help')renderHelp();else renderHome(); };
  window.openDrawer = () => { const drawer=document.getElementById('mobile-drawer');state.lastFocus=document.activeElement;state.drawer=true;drawer?.classList.add('open');document.getElementById('drawer-backdrop')?.classList.add('open');drawer?.setAttribute('aria-hidden','false');renderDrawer();setTimeout(()=>drawer?.querySelector('button')?.focus(),0); };
  window.closeDrawer = () => { const drawer=document.getElementById('mobile-drawer');state.drawer=false;drawer?.classList.remove('open');document.getElementById('drawer-backdrop')?.classList.remove('open');drawer?.setAttribute('aria-hidden','true'); if(state.lastFocus && typeof state.lastFocus.focus==='function') state.lastFocus.focus(); };

  function renderDrawer(){
    const content=document.getElementById('drawer-content'); if(!content)return; const role=state.role;
    if(role==='merchant') content.innerHTML=`<div class="drawer-section"><h4>MY BUSINESS</h4><button onclick="showWorkspace('merchant')">${icon('home')} Dashboard</button><button onclick="showWorkspace('merchant','orders')">${icon('box')} Orders</button><button onclick="showWorkspace('merchant','products')">${icon('store')} Products</button><button onclick="showWorkspace('merchant','inventory')">${icon('box')} Inventory</button><button onclick="showWorkspace('merchant','sales')">${icon('wallet')} Sales & payments</button><button onclick="showWorkspace('merchant','profile')">${icon('user')} Store profile</button></div><div class="drawer-section"><h4>ACCOUNT</h4><button onclick="show('account')">${icon('user')} Account settings</button><button onclick="show('home')">${icon('home')} Back to shopping</button></div>`;
    else if(role==='rider') content.innerHTML=`<div class="drawer-section"><h4>MY RIDER ACCOUNT</h4><button onclick="showWorkspace('rider')">${icon('home')} Dashboard</button><button onclick="showWorkspace('rider','deliveries')">${icon('truck')} Deliveries</button><button onclick="showWorkspace('rider','active')">${icon('truck')} Active delivery</button><button onclick="showWorkspace('rider','earnings')">${icon('wallet')} Earnings</button><button onclick="showWorkspace('rider','profile')">${icon('user')} Profile</button></div><div class="drawer-section"><h4>SHOPPING</h4><button onclick="show('home')">${icon('home')} Back to shopping</button></div>`;
    else if(role==='admin') content.innerHTML=`<div class="drawer-section"><h4>ADMIN</h4><button onclick="showWorkspace('admin')">${icon('home')} Dashboard</button><button onclick="showWorkspace('admin','users')">${icon('user')} Users</button><button onclick="showWorkspace('admin','merchants')">${icon('store')} Merchants</button><button onclick="showWorkspace('admin','orders')">${icon('box')} Orders & deliveries</button><button onclick="showWorkspace('admin','payments')">${icon('wallet')} Payments</button><button onclick="showWorkspace('admin','verification')">${icon('shield')} Verification</button><button onclick="showWorkspace('admin','commissions')">${icon('wallet')} Commissions</button></div>`;
    else content.innerHTML=`<div class="drawer-section"><h4>MY BUSIAN</h4><button onclick="show('account')">${icon('user')} My Account</button><button onclick="show('orders')">${icon('box')} Orders</button><button onclick="show('wishlist')">${icon('heart')} Wishlist</button><button onclick="show('notifications')">${icon('bell')} Notifications</button></div><div class="drawer-section"><div class="drawer-section-title"><h4>SHOP</h4><button class="see-all-button" onclick="show('shop')">See all</button></div><button onclick="show('stores')">${icon('store')} Stores</button><button onclick="show('shop')">${icon('box')} All products</button>${d.categories.slice(0,6).map(c=>`<button onclick="showCategory('${esc(c.id)}')">${esc(c.icon)} ${esc(c.name)}</button>`).join('')}</div><div class="drawer-section"><h4>JOIN BUSIAN</h4><button onclick="roles('merchant')">${icon('store')} Become a Merchant</button><button onclick="roles('rider')">${icon('truck')} Become a Rider</button><button onclick="roles('agent')">${icon('user')} Become a Field Agent</button></div><div class="drawer-section"><h4>HELP & SUPPORT</h4><button onclick="show('help')">Help Centre</button><button onclick="show('help')">Contact BUSIAN</button></div>`;
  }

  window.searchFromHome = value => { state.query=value; if(value.trim().length>=2) renderShop(); };
  window.showCategory = category => { state.category=category;state.query='';renderShop(); };
  window.filterProducts = value => { state.query=value;renderShop(false);const input=document.getElementById('shop-search');if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length);} };

  window.toggleWishlist = id => { if(wishlistHas(id)) state.wishlist=state.wishlist.filter(x=>x!==id); else state.wishlist=[...state.wishlist,id]; persistWishlist(); toast(wishlistHas(id)?'Added to wishlist':'Removed from wishlist'); if(document.querySelector('.product-grid')) renderCurrentGrid(); };
  function renderCurrentGrid(){ const grid=document.querySelector('.product-grid'); if(grid) grid.innerHTML=filteredProducts().map(productCard).join('')||`<div class="empty-state"><strong>No matching products.</strong><p>Try another search or category.</p></div>`; }

  window.openProduct = id => { const p=productById(id);if(!p)return;setActiveNav('shop');const priced=p.price!=null&&p.price!=='';app.innerHTML=`<section class="page-shell"><button class="back-button" type="button" onclick="show('shop')">← Back to shop</button><div class="product-detail"><div class="detail-image"><img src="${esc(p.image)}" alt="${esc(p.name)}"></div><div class="detail-content"><span class="eyebrow">${esc(p.category)}</span><h1>${esc(p.name)}</h1><button class="merchant-link large" type="button" onclick="openStore('${esc(p.merchantId)}')">${icon('shield')} ${esc(p.merchant)}</button><div class="detail-rating">${icon('star')} ${esc(p.rating)} · ${p.available?'Available':'Currently unavailable'}</div><h2>${money(p.price)}</h2><p class="muted">Product availability, price and stock will be authoritative from the verified merchant record when Supabase is connected.</p><div class="action-row"><button class="secondary" onclick="toggleWishlist('${esc(p.id)}')">${icon('heart')} ${wishlistHas(p.id)?'Saved':'Save to wishlist'}</button>${priced?`<button class="primary" onclick="addToCart('${esc(p.id)}')">${icon('cart')} Add to cart</button>`:`<button class="primary disabled-action" disabled>Price pending</button>`}</div></div></div></section>`; };

  window.addToCart = id => { const p=productById(id);if(!p||p.price==null){toast('This product needs a merchant price before it can be ordered.');return;}if(!p.available){toast('This product is currently unavailable.');return;}const existing=state.cart.find(i=>i.productId===id);if(existing)existing.quantity+=1;else state.cart.push({productId:id,quantity:1});persistCart();toast(`${p.name} added to cart`); };
  window.changeCartQuantity=(id,change)=>{const item=state.cart.find(i=>i.productId===id);if(!item)return;item.quantity+=change;if(item.quantity<=0)state.cart=state.cart.filter(i=>i.productId!==id);persistCart();renderCart();};
  window.removeFromCart=id=>{state.cart=state.cart.filter(i=>i.productId!==id);persistCart();renderCart();};

  window.openStore = merchantId => { const m=merchantById(merchantId);if(!m)return;const products=d.products.filter(p=>p.merchantId===merchantId);app.innerHTML=`<section class="page-shell"><button class="back-button" type="button" onclick="show('stores')">← Back to stores</button><div class="store-hero"><div class="store-avatar large">${esc(m.name.charAt(0))}</div><div><span class="verified-badge">${m.verified?'✓ Verified merchant':'Merchant profile'}</span><h1>${esc(m.name)}</h1><p>${esc(m.category)} · ${esc(m.location)}</p><small>${products.length} listed products</small></div></div><div class="section-heading-row store-products-heading"><h2>Products</h2></div><div class="product-grid">${products.length?products.map(productCard).join(''):`<div class="empty-state"><strong>No products listed yet.</strong></div>`}</div></section>`; };

  window.roles = requestedRole => { const roles=[{id:'customer',title:'Customer',icon:'user',text:'Discover products, place orders and track delivery.'},{id:'merchant',title:'Merchant',icon:'store',text:'List products, manage orders and grow your local business.'},{id:'rider',title:'Rider',icon:'truck',text:'Receive delivery jobs, manage pickups and track earnings.'},{id:'agent',title:'Field Agent',icon:'user',text:'Help local merchants join BUSIAN and support onboarding.'}];app.innerHTML=`<section class="page-shell role-page"><div class="section-heading"><span class="eyebrow">JOIN BUSIAN</span><h1>Choose how you want to use BUSIAN.</h1><p>Your selected role will be linked to your authenticated account and permissions when Supabase is connected.</p></div><div class="notice"><strong>Account security:</strong> role selection is only an onboarding choice here. Production access will be controlled by authentication, approval status and database permissions.</div><div class="role-grid" style="margin-top:16px">${roles.map(r=>`<button class="role-card" type="button" onclick="selectRole('${r.id}')"><span class="role-icon">${icon(r.icon)}</span><strong>${r.title}</strong><span>${r.text}</span><b>Continue →</b></button>`).join('')}</div></section>`; };
  window.selectRole = role => { state.role=role;safeSet('busian_preview_role',role); if(role==='merchant'||role==='rider')showAuthEntry(role);else if(role==='agent')showAuthEntry('agent');else renderAccount(); };
  function showAuthEntry(role){ app.innerHTML=`<section class="page-shell role-page"><button class="back-button" type="button" onclick="roles()">← Back to roles</button><div class="section-heading"><span class="eyebrow">${esc(role.toUpperCase())} ONBOARDING</span><h1>Create or sign in to your BUSIAN account.</h1><p>This screen is structured for Supabase Auth. Your role will not grant access until the authenticated account is verified and authorized.</p></div><div class="workspace-card"><div class="notice"><strong>Next connection:</strong> Supabase Auth will replace this entry point with secure email/phone authentication, profile creation and role approval.</div><div class="form-actions"><button class="secondary" type="button" onclick="show('account')">Return to account</button><button class="primary" type="button" onclick="showAuthForm('${esc(role)}')">Continue to secure sign in</button></div></div></section>`; }
  window.showAuthForm = role => { app.innerHTML=`<section class="page-shell role-page"><button class="back-button" type="button" onclick="showAuthEntry('${esc(role)}')">← Back</button><div class="section-heading"><span class="eyebrow">SECURE ACCESS</span><h1>${esc(role)} account</h1><p>The form structure is ready for Supabase Auth. No fake account is created by this frontend.</p></div><form class="workspace-card" onsubmit="return authPlaceholder(event,'${esc(role)}')"><div class="form-grid"><div class="form-field"><label for="auth-name">Full name</label><input id="auth-name" required autocomplete="name"><span class="field-error" id="auth-name-error">Enter your name.</span></div><div class="form-field"><label for="auth-phone">Phone number</label><input id="auth-phone" type="tel" required autocomplete="tel" placeholder="07xx xxx xxx"><span class="field-error" id="auth-phone-error">Enter a valid phone number.</span></div><div class="form-field full"><label for="auth-email">Email</label><input id="auth-email" type="email" required autocomplete="email"><span class="field-error" id="auth-email-error">Enter a valid email.</span></div></div><div class="form-actions"><button class="primary" type="submit">Continue</button></div></form></section>`; };
  window.authPlaceholder=(e,role)=>{e.preventDefault();toast(`Supabase Auth will securely create the ${role} account in the next stage.`);return false;};

  window.showWorkspace=(role=state.role,section='dashboard')=>{sta
