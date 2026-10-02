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
    authSession: null, authUser: null, authReady: false,
    drafts: safeJSON('busian_frontend_drafts', {}), fieldLeads: safeJSON('busian_field_leads', []), merchantProducts: []
  };

  function persistCart(){ safeSet('busian_cart', JSON.stringify(state.cart)); updateCartCount(); }
  function persistDrafts(){ safeSet('busian_frontend_drafts', JSON.stringify(state.drafts)); }
  function persistWishlist(){ safeSet('busian_wishlist', JSON.stringify(state.wishlist)); }
  function toast(message){ let t=document.getElementById('busian-toast'); if(!t){t=document.createElement('div');t.id='busian-toast';document.body.appendChild(t);} t.textContent=message;t.classList.add('show');clearTimeout(window.__busianToast);window.__busianToast=setTimeout(()=>t.classList.remove('show'),2300); }
  function updateCartCount(){ const el=document.getElementById('cart-count'); if(el) el.textContent=cartCount(); }
  function updateAuthUI(){
    const label=document.querySelector('.header-account-label');
    const button=document.querySelector('.header-account');
    if(label) label.textContent=state.authUser ? 'Account · Signed in' : 'Account';
    if(button) button.setAttribute('aria-label', state.authUser ? `Account — signed in as ${state.authUser.email || 'user'}` : 'Account');
  }

  async function refreshAuthState(){
    if(!window.busianGetSession) return;
    const { data, error } = await window.busianGetSession();
    if(error){ console.error('BUSIAN session error:', error); return; }
    state.authSession = data?.session || null;
    state.authUser = data?.session?.user || null;

    if(state.authUser?.id && window.busianGetProfile && window.busianGetUserRoles){
      try {
        const [profileResult, rolesResult] = await Promise.all([
          window.busianGetProfile(state.authUser.id),
          window.busianGetUserRoles(state.authUser.id)
        ]);
        if(profileResult.error) console.error('BUSIAN profile error:', profileResult.error);
        if(rolesResult.error) console.error('BUSIAN role error:', rolesResult.error);

        const databaseRole = rolesResult.data?.[0]?.role || profileResult.data?.default_role;
        const frontendRole = databaseRole === 'field_agent' ? 'agent' : databaseRole;
        const allowedRoles = ['customer','merchant','rider','agent','admin'];

        if(allowedRoles.includes(frontendRole)){
          state.role = frontendRole;
          safeSet('busian_preview_role', frontendRole);
        }
      } catch (roleError) {
        console.error('BUSIAN role loading error:', roleError);
      }
    }

    state.authReady = true;
    updateAuthUI();
  }

  function setActiveNav(page){
    document.querySelectorAll('[data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav===page));
    document.querySelectorAll('[data-mobile-nav]').forEach(x=>x.classList.toggle('active',x.dataset.mobileNav===page));
  }

  function filteredProducts(){
    return d.products.filter(p => {
      const cat=state.category==='all'||p.categoryId===state.category||p.category===categoryById(state.category)?.name;
      const q=`${p.name} ${p.category} ${p.merchant}`.toLowerCase();
      return cat && q.includes(state.query.toLowerCase());
    });
  }

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

  function categoryCards(limit){
    return d.categories.slice(0,limit||d.categories.length).map(c=>`<button class="category-card" type="button" onclick="showCategory('${esc(c.id)}')"><span class="category-image-wrap"><img src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy"></span><span class="category-card-body"><strong>${esc(c.name)}</strong><small>${esc(c.short)}</small></span></button>`).join('');
  }

  function trustStrip(){
    return `<div class="trust-strip"><span>${icon('shield')} Verified local merchants</span><span>${icon('wallet')} Secure checkout</span><span>${icon('truck')} Tracked delivery</span><span>${icon('user')} Local support</span></div>`;
  }

  function renderHeaderSearch(value=state.query){
    return `<div class="global-search-wrap"><span class="search-symbol">${icon('search')}</span><input id="global-search" type="search" value="${esc(value)}" placeholder="Search products, stores and categories" autocomplete="off" aria-label="Search products, stores and categories" oninput="searchFromHome(this.value)"><button type="button" onclick="show('shop')">Search</button></div>`;
  }

  window.show = page => {
    closeDrawer();
    if(page==='shop')renderShop();
    else if(page==='stores')renderStores();
    else if(page==='orders')renderOrders();
    else if(page==='account')renderAccount();
    else if(page==='cart')renderCart();
    else if(page==='checkout')renderCheckout();
    else if(page==='wishlist')renderWishlist();
    else if(page==='notifications')renderNotifications();
    else if(page==='help')renderHelp();
    else renderHome();
  };

  window.openDrawer = () => {
    const drawer=document.getElementById('mobile-drawer');
    state.lastFocus=document.activeElement;
    state.drawer=true;
    drawer?.classList.add('open');
    document.getElementById('drawer-backdrop')?.classList.add('open');
    drawer?.setAttribute('aria-hidden','false');
    renderDrawer();
    setTimeout(()=>drawer?.querySelector('button')?.focus(),0);
  };

  window.closeDrawer = () => {
    const drawer=document.getElementById('mobile-drawer');
    state.drawer=false;
    drawer?.classList.remove('open');
    document.getElementById('drawer-backdrop')?.classList.remove('open');
    drawer?.setAttribute('aria-hidden','true');
    if(state.lastFocus && typeof state.lastFocus.focus==='function') state.lastFocus.focus();
  };

  function renderDrawer(){
    const content=document.getElementById('drawer-content');
    if(!content)return;
    const role=state.role;

    if(role==='merchant')
      content.innerHTML=`<div class="drawer-section"><h4>MY BUSINESS</h4><button onclick="showWorkspace('merchant')">${icon('home')} Dashboard</button><button onclick="showWorkspace('merchant','orders')">${icon('box')} Orders</button><button onclick="showWorkspace('merchant','products')">${icon('store')} Products</button><button onclick="showWorkspace('merchant','inventory')">${icon('box')} Inventory</button><button onclick="showWorkspace('merchant','sales')">${icon('wallet')} Sales & payments</button><button onclick="showWorkspace('merchant','profile')">${icon('user')} Store profile</button></div><div class="drawer-section"><h4>ACCOUNT</h4><button onclick="show('account')">${icon('user')} Account settings</button><button onclick="show('home')">${icon('home')} Back to shopping</button></div>`;
    else if(role==='rider')
      content.innerHTML=`<div class="drawer-section"><h4>MY RIDER ACCOUNT</h4><button onclick="showWorkspace('rider')">${icon('home')} Dashboard</button><button onclick="showWorkspace('rider','deliveries')">${icon('truck')} Deliveries</button><button onclick="showWorkspace('rider','active')">${icon('truck')} Active delivery</button><button onclick="showWorkspace('rider','earnings')">${icon('wallet')} Earnings</button><button onclick="showWorkspace('rider','profile')">${icon('user')} Profile</button></div><div class="drawer-section"><h4>SHOPPING</h4><button onclick="show('home')">${icon('home')} Back to shopping</button></div>`;
    else if(role==='admin')
      content.innerHTML=`<div class="drawer-section"><h4>ADMIN</h4><button onclick="showWorkspace('admin')">${icon('home')} Dashboard</button><button onclick="showWorkspace('admin','users')">${icon('user')} Users</button><button onclick="showWorkspace('admin','merchants')">${icon('store')} Merchants</button><button onclick="showWorkspace('admin','orders')">${icon('box')} Orders & deliveries</button><button onclick="showWorkspace('admin','payments')">${icon('wallet')} Payments</button><button onclick="showWorkspace('admin','verification')">${icon('shield')} Verification</button><button onclick="showWorkspace('admin','commissions')">${icon('wallet')} Commissions</button></div>`;
    else
      content.innerHTML=`<div class="drawer-section"><h4>MY BUSIAN</h4><button onclick="show('account')">${icon('user')} My Account</button><button onclick="show('orders')">${icon('box')} Orders</button><button onclick="show('wishlist')">${icon('heart')} Wishlist</button><button onclick="show('notifications')">${icon('bell')} Notifications</button></div><div class="drawer-section"><div class="drawer-section-title"><h4>SHOP</h4><button class="see-all-button" onclick="show('shop')">See all</button></div><button onclick="show('stores')">${icon('store')} Stores</button><button onclick="show('shop')">${icon('box')} All products</button>${d.categories.slice(0,6).map(c=>`<button onclick="showCategory('${esc(c.id)}')">${esc(c.icon)} ${esc(c.name)}</button>`).join('')}</div><div class="drawer-section"><h4>JOIN BUSIAN</h4><button onclick="roles('merchant')">${icon('store')} Become a Merchant</button><button onclick="roles('rider')">${icon('truck')} Become a Rider</button><button onclick="roles('agent')">${icon('user')} Become a Field Agent</button></div><div class="drawer-section"><h4>HELP & SUPPORT</h4><button onclick="show('help')">Help Centre</button><button onclick="show('help')">Contact BUSIAN</button></div>`;
  }

  window.searchFromHome = value => {
    state.query=value;
    if(value.trim().length>=2) renderShop();
  };

  window.showCategory = category => {
    state.category=category;
    state.query='';
    renderShop();
  };

  window.filterProducts = value => {
    state.query=value;
    renderShop(false);
    const input=document.getElementById('shop-search');
    if(input){
      input.focus();
      input.setSelectionRange(input.value.length,input.value.length);
    }
  };

  window.toggleWishlist = id => {
    if(wishlistHas(id)) state.wishlist=state.wishlist.filter(x=>x!==id);
    else state.wishlist=[...state.wishlist,id];
    persistWishlist();
    toast(wishlistHas(id)?'Added to wishlist':'Removed from wishlist');
    if(document.querySelector('.product-grid')) renderCurrentGrid();
  };

  function renderCurrentGrid(){
    const grid=document.querySelector('.product-grid');
    if(grid) grid.innerHTML=filteredProducts().map(productCard).join('')||`<div class="empty-state"><strong>No matching products.</strong><p>Try another search or category.</p></div>`;
  }

  window.openProduct = id => {
    const p=productById(id);
    if(!p)return;
    setActiveNav('shop');
    const priced=p.price!=null&&p.price!=='';
    app.innerHTML=`<section class="page-shell"><button class="back-button" type="button" onclick="show('shop')">← Back to shop</button><div class="product-detail"><div class="detail-image"><img src="${esc(p.image)}" alt="${esc(p.name)}"></div><div class="detail-content"><span class="eyebrow">${esc(p.category)}</span><h1>${esc(p.name)}</h1><button class="merchant-link large" type="button" onclick="openStore('${esc(p.merchantId)}')">${icon('shield')} ${esc(p.merchant)}</button><div class="detail-rating">${icon('star')} ${esc(p.rating)} · ${p.available?'Available':'Currently unavailable'}</div><h2>${money(p.price)}</h2><p class="muted">Product availability, price and stock will be authoritative from the verified merchant record when Supabase is connected.</p><div class="action-row"><button class="secondary" onclick="toggleWishlist('${esc(p.id)}')">${icon('heart')} ${wishlistHas(p.id)?'Saved':'Save to wishlist'}</button>${priced?`<button class="primary" onclick="addToCart('${esc(p.id)}')">${icon('cart')} Add to cart</button>`:`<button class="primary disabled-action" disabled>Price pending</button>`}</div></div></div></section>`;
  };

  window.addToCart = id => {
    const p=productById(id);
    if(!p||p.price==null){
      toast('This product needs a merchant price before it can be ordered.');
      return;
    }
    if(!p.available){
      toast('This product is currently unavailable.');
      return;
    }
    const existing=state.cart.find(i=>i.productId===id);
    if(existing)existing.quantity+=1;
    else state.cart.push({productId:id,quantity:1});
    persistCart();
    toast(`${p.name} added to cart`);
  };

  window.changeCartQuantity=(id,change)=>{
    const item=state.cart.find(i=>i.productId===id);
    if(!item)return;
    item.quantity+=change;
    if(item.quantity<=0)state.cart=state.cart.filter(i=>i.productId!==id);
    persistCart();
    renderCart();
  };

  window.removeFromCart=id=>{
    state.cart=state.cart.filter(i=>i.productId!==id);
    persistCart();
    renderCart();
  };

  window.openStore = merchantId => {
    const m=merchantById(merchantId);
    if(!m)return;
    const products=d.products.filter(p=>p.merchantId===merchantId);
    app.innerHTML=`<section class="page-shell"><button class="back-button" type="button" onclick="show('stores')">← Back to stores</button><div class="store-hero"><div class="store-avatar large">${esc(m.name.charAt(0))}</div><div><span class="verified-badge">${m.verified?'✓ Verified merchant':'Merchant profile'}</span><h1>${esc(m.name)}</h1><p>${esc(m.category)} · ${esc(m.location)}</p><small>${products.length} listed products</small></div></div><div class="section-heading-row store-products-heading"><h2>Products</h2></div><div class="product-grid">${products.length?products.map(productCard).join(''):`<div class="empty-state"><strong>No products listed yet.</strong></div>`}</div></section>`;
  };

  window.roles = requestedRole => {
    const roles=[
      {id:'customer',title:'Customer',icon:'user',text:'Discover products, place orders and track delivery.'},
      {id:'merchant',title:'Merchant',icon:'store',text:'List products, manage orders and grow your local business.'},
      {id:'rider',title:'Rider',icon:'truck',text:'Receive delivery jobs, manage pickups and track earnings.'},
      {id:'agent',title:'Field Agent',icon:'user',text:'Help local merchants join BUSIAN and support onboarding.'}
    ];

    app.innerHTML=`<section class="page-shell role-page"><div class="section-heading"><span class="eyebrow">JOIN BUSIAN</span><h1>Choose how you want to use BUSIAN.</h1><p>Your selected role will be linked to your authenticated account and permissions when Supabase is connected.</p></div><div class="notice"><strong>Account security:</strong> role selection is only an onboarding choice here. Production access will be controlled by authentication, approval status and database permissions.</div><div class="role-grid" style="margin-top:16px">${roles.map(r=>`<button class="role-card" type="button" onclick="selectRole('${r.id}')"><span class="role-icon">${icon(r.icon)}</span><strong>${r.title}</strong><span>${r.text}</span><b>Continue →</b></button>`).join('')}</div></section>`;
  };

  window.selectRole = role => {
    state.role=role;
    safeSet('busian_preview_role',role);
    if(role==='merchant'||role==='rider')showAuthEntry(role);
    else if(role==='agent')showAuthEntry('agent');
    else showAuthEntry('customer');
  };

  function showAuthEntry(role){
    app.innerHTML=`<section class="page-shell role-page"><button class="back-button" type="button" onclick="roles()">← Back to roles</button><div class="section-heading"><span class="eyebrow">${esc(role.toUpperCase())} ONBOARDING</span><h1>Create or sign in to your BUSIAN account.</h1><p>This screen is connected to Supabase Auth. Your role will not grant access until the authenticated account is verified and authorized.</p></div><div class="workspace-card"><div class="notice"><strong>Account security:</strong> Authentication is handled by Supabase. Profile creation and role approval will be connected in the next stages.</div><div class="form-actions"><button class="secondary" type="button" onclick="show('account')">Return to account</button><button class="primary" type="button" onclick="showAuthForm('${esc(role)}','signup')">Continue to secure sign in</button></div></div></section>`;
  }

  window.showAuthForm = (role, mode = 'signup') => {
    const signup = mode !== 'signin';

    app.innerHTML=`<section class="page-shell role-page"><button class="back-button" type="button" onclick="showAuthEntry('${esc(role)}')">← Back</button><div class="section-heading"><span class="eyebrow">SECURE ACCESS</span><h1>${signup?'Create':'Sign in to'} your ${esc(role)} account</h1><p>Authentication is securely handled by Supabase Auth.</p></div><form class="workspace-card" onsubmit="return handleAuth(event,'${esc(role)}','${signup?'signup':'signin'}')">${signup?`<div class="form-grid"><div class="form-field"><label for="auth-name">Full name</label><input id="auth-name" required autocomplete="name"><span class="field-error" id="auth-name-error">Enter your name.</span></div><div class="form-field"><label for="auth-phone">Phone number</label><input id="auth-phone" type="tel" required autocomplete="tel" placeholder="07xx xxx xxx"><span class="field-error" id="auth-phone-error">Enter a valid phone number.</span></div></div>`:''}<div class="form-grid"><div class="form-field full"><label for="auth-email">Email</label><input id="auth-email" type="email" required autocomplete="email"></div><div class="form-field full"><label for="auth-password">Password</label><input id="auth-password" type="password" required minlength="6" autocomplete="${signup?'new-password':'current-password'}"></div></div><div class="form-actions"><button class="primary" type="submit">${signup?'Create account':'Sign in'}</button><button class="secondary" type="button" onclick="showAuthForm('${esc(role)}','${signup?'signin':'signup'}')">${signup?'Already have an account? Sign in':'Need an account? Create one'}</button></div></form></section>`;
  };

  window.handleAuth = async (event, role, mode) => {
    event.preventDefault();

    const email = document.getElementById('auth-email')?.value.trim();
    const password = document.getElementById('auth-password')?.value;

    if (!email || !password) return false;

    try {
      let result;

      if (mode === 'signup') {
        const name = document.getElementById('auth-name')?.value.trim();
        const phone = document.getElementById('auth-phone')?.value.trim();

        result = await window.busianSignUp(email, password, {
          emailRedirectTo: 'https://busian040-creator.github.io/Busiani/',
          data: { full_name: name, phone, selected_role: role }
        });
      } else {
        result = await window.busianSignIn(email, password);
      }

      if (result.error) {
        toast(result.error.message || 'Authentication failed.');
        return false;
      }

      safeSet('busian_preview_role', role);
      state.role = role;

      if (mode === 'signup' && result.data?.user && !result.data?.session) {
        toast('Account created. Check your email to confirm your account, then sign in.');
        return false;
      }

      if(result.data?.session) await refreshAuthState();

      toast(mode === 'signup' ? 'Account created successfully.' : 'Signed in successfully.');

      if(['merchant','rider','agent','admin'].includes(state.role))
        showWorkspace(state.role);
      else
        renderAccount();

    } catch (error) {
      console.error('BUSIAN authentication error:', error);
      toast('Authentication failed. Please try again.');
    }

    return false;
  };

  window.showWorkspace=(role=state.role,section='dashboard')=>{
    state.role=role;
    safeSet('busian_preview_role',role);
    closeDrawer();

    if(role==='merchant')renderMerchant(section);
    else if(role==='rider')renderRider(section);
    else if(role==='admin')renderAdmin(section);
    else if(role==='agent')renderAgent(section);
    else renderAccount();
  };

  function supabaseReady(){ return !!window.busianSupabase; }

  function normalizeCategoryKey(value){
    return String(value||'')
      .toLowerCase()
      .replace(/&/g,'and')
      .replace(/[^a-z0-9]+/g,'-')
      .replace(/^-|-$/g,'');
  }

  function localCategoryPresentation(row){
    const key=normalizeCategoryKey(row.slug||row.name);
    const byKey=d.categories.find(c=>normalizeCategoryKey(c.id)===key||normalizeCategoryKey(c.name)===key);
    const byName=d.categories.find(c=>normalizeCategoryKey(c.name)===normalizeCategoryKey(row.name));
    return byKey||byName||{};
  }

  function categoryImageFor(row){
    const ui=localCategoryPresentation(row);
    return ui.image || 'Assets/1.jpg';
  }

  async function loadLiveCatalog(){
    if(!supabaseReady()) return false;

    try{
      const [
        {data:merchantRows,error:merchantError},
        {data:productRows,error:productError}
      ]=await Promise.all([
        window.busianSupabase
          .from('merchants')
          .select('id,business_name,phone,email,category,location,county,description,logo_url,verification_status,is_active')
          .eq('is_active',true),

        window.busianSupabase
          .from('products')
          .select('id,merchant_id,category_id,name,description,price,currency,stock_quantity,image_url,sku,is_available,is_published,categories(id,name,slug),merchants(id,business_name,category,location,verification_status,is_active),product_images(storage_path,alt_text,sort_order)')
          .eq('is_published',true)
          .eq('is_available',true)
      ]);

      if(merchantError) console.error('BUSIAN merchants error:',merchantError);
      if(productError) console.error('BUSIAN products error:',productError);

      if(merchantRows?.length){
        d.merchants=merchantRows.map(m=>({
          id:m.id,
          name:m.business_name||'Local merchant',
          category:m.category||'',
          location:m.location||'Busia',
          verified:m.verification_status==='approved',
          products:0,
          logo:m.logo_url||''
        }));
      }

      if(productRows?.length){
        d.products=productRows.map(p=>{
          const c=p.categories||{};
          const m=p.merchants||{};

          const image=
            p.image_url ||
            p.product_images?.slice()?.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))[0]?.storage_path ||
            categoryImageFor(c);

          return {
            id:p.id,
            name:p.name,
            description:p.description||'',
            category:c.name||'Other',
            categoryId:c.slug||c.id||'',
            image,
            price:p.price,
            currency:p.currency||'KES',
            stock:p.stock_quantity,
            merchantId:p.merchant_id,
            merchant:m.business_name||merchantById(p.merchant_id)?.name||'Local merchant',
            rating:'—',
            available:p.is_available!==false
          };
        });

        d.products.forEach(p=>{
          const m=d.merchants.find(x=>x.id===p.merchantId);
          if(m)m.products=(m.products||0)+1;
        });
      }

      return !!(merchantRows?.length||productRows?.length);

    }catch(error){
      console.error('BUSIAN live catalog error:',error);
      return false;
    }
  }

  async function loadOwnProducts(merchantId){
    if(!merchantId||!supabaseReady()) return [];

    const {data,error}=await window.busianSupabase
      .from('products')
      .select('id,merchant_id,category_id,name,description,price,currency,stock_quantity,image_url,sku,is_available,is_published,categories(id,name,slug),product_images(storage_path,alt_text,sort_order)')
      .eq('merchant_id',merchantId)
      .order('created_at',{ascending:false});

    if(error){
      console.error('BUSIAN merchant products error:',error);
      return [];
    }

    return (data||[]).map(p=>{
      const c=p.categories||{};
      const image=
        p.image_url ||
        p.product_images?.slice()?.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))[0]?.storage_path ||
        categoryImageFor(c);

      return {
        id:p.id,
        name:p.name,
        description:p.description||'',
        category:c.name||'Other',
        categoryId:c.slug||c.id||'',
        image,
        price:p.price,
        currency:p.currency||'KES',
        stock:p.stock_quantity,
        merchantId:p.merchant_id,
        merchant:currentMerchantNameCache(p.merchant_id),
        rating:'—',
        available:p.is_available!==false,
        published:p.is_published!==false,
        dbCategoryId:p.category_id
      };
    });
  }

    function currentMerchantNameCache(merchantId){ return d.merchants.find(m=>m.id===merchantId)?.name || 'My Business'; }

  async function currentMerchant(){
    if(!state.authUser?.id||!supabaseReady()) return null;
    const {data,error}=await window.busianSupabase
      .from('merchants')
      .select('id,business_name,phone,email,category,location,county,description,logo_url,verification_status,is_active')
      .eq('owner_id',state.authUser.id)
      .maybeSingle();

    if(error){
      console.error('BUSIAN merchant profile error:',error);
      return null;
    }

    return data||null;
  }

  async function renderLiveCustomerOrders(){
    if(!state.authUser?.id||!supabaseReady()) return null;

    const {data,error}=await window.busianSupabase
      .from('orders')
      .select('id,order_number,merchant_id,status,subtotal,delivery_fee,platform_fee,total_amount,currency,customer_notes,placed_at,created_at,updated_at,merchants(business_name),order_items(id,product_name,unit_price,quantity,line_total)')
      .eq('customer_id',state.authUser.id)
      .order('created_at',{ascending:false});

    if(error){
      console.error('BUSIAN customer orders error:',error);
      return null;
    }

    return data||[];
  }

  function renderOrderRows(orders){
    if(!orders.length)
      return `<div class="empty-state"><div class="empty-icon">${icon('box')}</div><strong>No orders yet.</strong><p>Once you place an order, its payment and delivery lifecycle will appear here.</p><button class="primary" onclick="show('shop')">Browse products</button></div>`;

    return `<div class="management-list">${orders.map(o=>`<div><span><strong>${esc(o.order_number||o.id.slice(0,8))}</strong><small>${esc(o.merchants?.business_name||'Merchant')} · ${esc(o.status||'pending')} · ${money(o.total_amount)}</small></span><span class="status-badge pending">${esc(o.status||'pending')}</span></div>`).join('')}</div>`;
  }

  async function createAddressForCheckout(){
    const payload={
      user_id:state.authUser.id,
      label:'Checkout',
      recipient_name:document.getElementById('delivery-name').value.trim(),
      phone:document.getElementById('delivery-phone').value.trim(),
      area:document.getElementById('delivery-area').value.trim(),
      town:'Busia',
      county:'Busia County',
      address_line:document.getElementById('delivery-address').value.trim(),
      delivery_notes:document.getElementById('delivery-address').value.trim(),
      is_default:false
    };

    const {data,error}=await window.busianSupabase
      .from('addresses')
      .insert(payload)
      .select('id')
      .single();

    if(error) throw error;
    return data.id;
  }

  async function createOrdersFromCart(addressId){
    const items=cartItems();
    const groups=new Map();

    items.forEach(i=>{
      const key=i.product.merchantId;
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(i);
    });

    const created=[];

    for(const [merchantId,group] of groups){
      const subtotal=group.reduce(
        (n,i)=>n+Number(i.product.price)*i.quantity,
        0
      );

      const {data:order,error:orderError}=await window.busianSupabase
        .from('orders')
        .insert({
          customer_id:state.authUser.id,
          merchant_id:merchantId,
          delivery_address_id:addressId,
          subtotal,
          delivery_fee:0,
          platform_fee:0,
          total_amount:subtotal,
          currency:'KES',
          customer_notes:'BUSIAN customer order'
        })
        .select('id,order_number')
        .single();

      if(orderError) throw orderError;

      const rows=group.map(i=>({
        order_id:order.id,
        product_id:i.product.id,
        product_name:i.product.name,
        unit_price:Number(i.product.price),
        quantity:i.quantity,
        line_total:Number(i.product.price)*i.quantity
      }));

      const {error:itemError}=await window.busianSupabase
        .from('order_items')
        .insert(rows);

      if(itemError) throw itemError;

      created.push(order);
    }

    return created;
  }

  async function loadMerchantOrders(){
    const merchant=await currentMerchant();

    if(!merchant)
      return {merchant:null,orders:[]};

    const {data,error}=await window.busianSupabase
      .from('orders')
      .select('id,order_number,status,subtotal,delivery_fee,total_amount,currency,placed_at,created_at,updated_at,order_items(product_name,unit_price,quantity,line_total)')
      .eq('merchant_id',merchant.id)
      .order('created_at',{ascending:false});

    if(error){
      console.error('BUSIAN merchant orders error:',error);
      return {merchant,orders:[]};
    }

    return {merchant,orders:data||[]};
  }

  async function loadRiderAssignments(){
    if(!state.authUser?.id||!supabaseReady()) return [];

    const {data,error}=await window.busianSupabase
      .from('delivery_assignments')
      .select('id,order_id,rider_id,status,accepted_at,picked_up_at,out_for_delivery_at,delivered_at,rejection_reason,notes,created_at,updated_at,orders(order_number,status,total_amount,delivery_address_id,merchants(business_name))')
      .eq('rider_id',state.authUser.id)
      .order('created_at',{ascending:false});

    if(error){
      console.error('BUSIAN rider assignments error:',error);
      return [];
    }

    return data||[];
  }

  async function loadAdminSnapshot(){
    if(!state.authUser?.id||!supabaseReady()) return {};

    const queries=await Promise.allSettled([
      window.busianSupabase.from('profiles').select('id',{count:'exact',head:true}),
      window.busianSupabase.from('merchants').select('id',{count:'exact',head:true}),
      window.busianSupabase.from('orders').select('id',{count:'exact',head:true}),
      window.busianSupabase.from('payments').select('id',{count:'exact',head:true})
    ]);

    return {
      users:queries[0].value?.count??'—',
      merchants:queries[1].value?.count??'—',
      orders:queries[2].value?.count??'—',
      payments:queries[3].value?.count??'—'
    };
  }

  function renderHome(){
    state.category='all';
    state.query='';
    setActiveNav('home');

    const featured=d.products.slice(0,6);

    app.innerHTML=`<section class="home-page"><div class="home-topline"><span>${icon('location')} Delivering in <strong>${esc(d.location.name)}</strong></span><button type="button" onclick="show('stores')">Explore local stores →</button></div>${renderHeaderSearch()}<section class="hero-market"><div class="hero-market-copy"><span class="eyebrow">BUSIAN LOCAL COMMERCE</span><h1>Find it locally.<br><span>Get it delivered.</span></h1><p>Discover products from local businesses in Busia and connect to the people who make delivery possible.</p><div class="hero-actions"><button class="primary" onclick="show('shop')">Start shopping</button><button class="secondary" onclick="show('stores')">Browse stores</button></div></div><div class="hero-market-side"><span class="hero-round-icon"><img src="${LOGO}" alt="BUSIAN"></span><strong>Local businesses.<br>One connected marketplace.</strong><small>Merchant → BUSIAN → Rider → Customer</small></div></section>${trustStrip()}<section class="section-shell"><div class="section-heading-row"><div><span class="eyebrow">EXPLORE</span><h2>Shop by category</h2></div><button class="text-button" onclick="show('shop')">See all →</button></div><div class="category-grid">${categoryCards(8)}</div></section><section class="section-shell"><div class="section-heading-row"><div><span class="eyebrow">LOCAL DISCOVERY</span><h2>Products available through BUSIAN</h2></div><button class="text-button" onclick="show('shop')">View all →</button></div><div class="product-grid">${featured.map(productCard).join('')}</div></section><section class="local-commerce-card"><div><span class="eyebrow">GROW WITH BUSIAN</span><h2>Do you run a local business?</h2><p>Bring your products onto BUSIAN and manage your catalogue, orders and delivery workflow from one merchant workspace.</p></div><button class="primary" onclick="roles('merchant')">Become a merchant</button></section></section>`;
  }

  function renderShop(){
    setActiveNav('shop');

    const ps=filteredProducts();

    app.innerHTML=`<section class="page-shell"><div class="section-heading"><span class="eyebrow">BUSIAN MARKETPLACE</span><h1>Shop local.</h1><p>Search products, stores and categories. Only products with an active merchant price can be ordered.</p></div><div class="shop-tools"><div class="shop-search"><span>${icon('search')}</span><input id="shop-search" type="search" aria-label="Search products and businesses" placeholder="Search products or businesses..." value="${esc(state.query)}" oninput="filterProducts(this.value)"></div><select aria-label="Filter by category" onchange="showCategory(this.value)"><option value="all">All categories</option>${d.categories.map(c=>`<option value="${esc(c.id)}" ${state.category===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div class="category-pills"><button class="${state.category==='all'?'active':''}" onclick="showCategory('all')">All</button>${d.categories.map(c=>`<button class="${state.category===c.id?'active':''}" onclick="showCategory('${esc(c.id)}')">${esc(c.name)}</button>`).join('')}</div><div class="product-grid">${ps.length?ps.map(productCard).join(''):`<div class="empty-state"><strong>No matching products.</strong><p>Try another category or search term.</p></div>`}</div></section>`;
  }

  function renderStores(){
    setActiveNav('stores');

    app.innerHTML=`<section class="page-shell"><div class="section-heading"><span class="eyebrow">LOCAL BUSINESSES</span><h1>Stores near you.</h1><p>Explore verified businesses and the products they offer through BUSIAN.</p></div><div class="store-grid">${d.merchants.map(m=>`<article class="store-card"><div class="store-avatar">${esc(m.name.charAt(0))}</div><div><span class="verified-badge">${m.verified?'✓ Verified':'Pending verification'}</span><h3>${esc(m.name)}</h3><p>${esc(m.category)} · ${icon('location')} ${esc(m.location)}</p><small>${m.products} listed products</small></div><button class="secondary small" onclick="openStore('${esc(m.id)}')">Visit store</button></article>`).join('')}</div></section>`;
  }

  async function renderOrders(){
    setActiveNav('orders');

    app.innerHTML=`<section class="page-shell"><div class="section-heading"><span class="eyebrow">MY ORDERS</span><h1>Your orders.</h1><p>Your authenticated orders are loaded from Supabase.</p></div><div id="orders-live" class="empty-state compact">Loading your orders…</div></section>`;

    const orders=await renderLiveCustomerOrders();
    const target=document.getElementById('orders-live');

    if(target)
      target.outerHTML=renderOrderRows(orders||[]);
  }

  function renderAccount(){
    setActiveNav('account');

    const roleLabel=state.role==='customer'?'Customer':state.role.charAt(0).toUpperCase()+state.role.slice(1);
    const signedIn=!!state.authUser;
    const email=signedIn ? esc(state.authUser.email || '') : '';

    app.innerHTML=`<section class="page-shell account-page"><div class="account-hero"><span class="account-avatar">${icon('user')}</span><div><span class="eyebrow">MY BUSIAN</span><h1>${signedIn ? `${roleLabel} account` : 'Account'}</h1>${signedIn?`<div class="verified-badge" style="display:inline-flex;margin:8px 0">✓ Signed in</div><p>${email}</p>`:`<p>You are not currently signed in. Sign in to access your BUSIAN account.</p>`}</div></div>${signedIn?`<div class="account-grid"><button onclick="show('orders')"><strong>${icon('box')} Orders</strong><span>Track purchases and delivery</span></button><button onclick="show('wishlist')"><strong>${icon('heart')} Wishlist</strong><span>${state.wishlist.length} saved item(s)</span></button><button onclick="show('cart')"><strong>${icon('cart')} Cart</strong><span>${cartCount()} item(s) waiting</span></button><button onclick="roles()"><strong>${icon('plus')} Join another role</strong><span>Merchant, rider or field agent</span></button><button onclick="show('notifications')"><strong>${icon('bell')} Notifications</strong><span>Order and account updates</span></button><button onclick="show('help')"><strong>${icon('shield')} Help & support</strong><span>Get assistance from BUSIAN</span></button></div><div class="workspace-card" style="margin-top:16px"><div class="form-actions"><button class="secondary" type="button" onclick="busianLogout()">Sign out</button></div></div>`:`<div class="workspace-card"><div class="form-actions"><button class="primary" type="button" onclick="roles()">Sign in / Create account</button></div></div>`}</section>`;
  }

  window.busianLogout = async () => {
    if(!window.busianSignOut) return false;

    const { error } = await window.busianSignOut();

    if(error){
      toast(error.message || 'Could not sign out.');
      return false;
    }

    state.authSession=null;
    state.authUser=null;
    state.authReady=true;
    state.role='customer';

    safeSet('busian_preview_role','customer');
    updateAuthUI();

    toast('You have been signed out.');
    renderHome();

    return false;
  };

  function renderWishlist(){
    setActiveNav('account');

    const items=state.wishlist.map(productById).filter(Boolean);

    app.innerHTML=`<section class="page-shell"><div class="section-heading"><span class="eyebrow">MY BUSIAN</span><h1>Wishlist</h1><p>Saved products will sync to your account when Supabase is connected.</p></div>${items.length?`<div class="product-grid wishlist-grid">${items.map(productCard).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">${icon('heart')}</div><strong>Your wishlist is empty.</strong><p>Save products you want to revisit.</p><button class="primary" onclick="show('shop')">Browse products</button></div>`}</section>`;
  }

  function renderNotifications(){
    app.innerHTML=`<section class="page-shell"><div class="section-heading"><span class="eyebrow">NOTIFICATIONS</span><h1>Updates</h1><p>Live order, payment, delivery and account notifications will be stored in Supabase.</p></div><div class="empty-state compact"><div class="empty-icon">${icon('bell')}</div><strong>No notifications.</strong><p>You're up to date.</p></div></section>`;
  }

  function renderHelp(){
    app.innerHTML=`<section class="page-shell"><div class="section-heading"><span class="eyebrow">SUPPORT</span><h1>How can we help?</h1><p>BUSIAN support will be connected to authenticated customer, merchant and rider records.</p></div><div class="account-grid"><button onclick="toast('Support channel will be connected in the platform services stage.')"><strong>Order support</strong><span>Payments, delivery and order issues</span></button><button onclick="toast('Merchant support will be connected in the platform services stage.')"><strong>Merchant support</strong><span>Catalogue, orders and verification</span></button><button onclick="toast('Rider support will be connected in the platform services stage.')"><strong>Rider support</strong><span>Delivery jobs and earnings</span></button><button onclick="toast('BUSIAN contact channel will be connected in the platform services stage.')"><strong>Contact BUSIAN</strong><span>General assistance</span></button></div></section>`;
  }

  function cartItems(){
    return state.cart.map(i=>({...i,product:productById(i.productId)})).filter(i=>i.product);
  }

  function renderCart(){
    setActiveNav('shop');

    const items=cartItems();
    const subtotal=items.reduce((n,i)=>
      n+(Number(i.product.price)||0)*i.quantity,0);

    app.innerHTML=`<section class="page-shell"><div class="section-heading"><span class="eyebrow">YOUR CART</span><h1>Review your items.</h1><p>Only products with merchant-confirmed prices can proceed to checkout.</p></div>${items.length?`<div class="cart-layout"><div class="cart-list">${items.map(i=>`<article class="cart-item"><img src="${esc(i.product.image)}" alt="${esc(i.product.name)}"><div><strong>${esc(i.product.name)}</strong><small>${esc(i.product.merchant)}</small><b>${money(i.product.price)}</b><div class="qty-controls"><button onclick="changeCartQuantity('${esc(i.productId)}',-1)" aria-label="Decrease quantity">−</button><span>${i.quantity}</span><button onclick="changeCartQuantity('${esc(i.productId)}',1)" aria-label="Increase quantity">+</button><button class="remove-link" onclick="removeFromCart('${esc(i.productId)}')">Remove</button></div></div></article>`).join('')}</div><aside class="cart-summary"><h3>Order summary</h3><div><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div><span>Delivery</span><span>Calculated at checkout</span></div><hr><div><span>Total before delivery</span><strong>${money(subtotal)}</strong></div><button class="primary full" onclick="show('checkout')">Proceed to checkout</button></aside></div>`:`<div class="empty-state"><div class="empty-icon">${icon('cart')}</div><strong>Your cart is empty.</strong><p>Add a product with a confirmed merchant price to begin checkout.</p><button class="primary" onclick="show('shop')">Browse products</button></div>`}</section>`;
  }

  window.renderCheckout=()=>renderCheckout();

  function renderCheckout(){
    const items=cartItems();

    if(!items.length){
      show('cart');
      return;
    }

    const invalid=items.some(i=>i.product.price==null);

    app.innerHTML=`<section class="page-shell"><button class="back-button" type="button" onclick="show('cart')">← Back to cart</button><div class="section-heading"><span class="eyebrow">CHECKOUT</span><h1>Complete your order.</h1><p>Delivery address, order summary and M-Pesa payment will connect to Supabase and Daraja.</p></div><div class="checkout-layout"><form class="checkout-block" onsubmit="return submitOrderStructure(event)"><h3>1. Delivery details</h3><div class="form-grid"><div class="form-field full"><label for="delivery-name">Recipient name</label><input id="delivery-name" required autocomplete="name"><span class="field-error" id="delivery-name-error">Enter the recipient name.</span></div><div class="form-field"><label for="delivery-phone">Phone</label><input id="delivery-phone" type="tel" required autocomplete="tel"><span class="field-error" id="delivery-phone-error">Enter a phone number.</span></div><div class="form-field"><label for="delivery-area">Area</label><input id="delivery-area" required placeholder="e.g. Busia Town"><span class="field-error" id="delivery-area-error">Enter the delivery area.</span></div><div class="form-field full"><label for="delivery-address">Delivery address / landmark</label><textarea id="delivery-address" required placeholder="Building, street, landmark or instructions"></textarea><span class="field-error" id="delivery-address-error">Enter delivery instructions or address.</span></div></div><h3 style="margin-top:24px">2. Payment</h3><button class="payment-method" type="button"><span>${icon('wallet')}</span><div><strong>M-Pesa</strong><small>STK Push will be initiated securely after Supabase/Daraja integration.</small></div>${icon('chevron')}</button><div class="notice" style="margin-top:12px"><strong>Payment security:</strong> M-Pesa credentials will never be placed in this frontend. Payment requests and callbacks will run through a secure backend function.</div><div class="form-actions"><button class="primary" type="submit">Continue to secure payment</button></div></form><aside class="checkout-summary"><h3>Order summary</h3>${items.map(i=>`<div class="summary-line"><span>${esc(i.product.name)} × ${i.quantity}</span><strong>${money(Number(i.product.price)*i.quantity)}</strong></div>`).join('')}<hr><div class="summary-line"><span>Subtotal</span><strong>${money(items.reduce((n,i)=>n+Number(i.product.price)*i.quantity,0))}</strong></div><div class="summary-line"><span>Delivery</span><span>Calculated</span></div>${invalid?`<div class="notice" style="margin-top:14px">One or more items do not have a confirmed merchant price and cannot be submitted.</div>`:''}</aside></div></section>`;
  }

  window.submitOrderStructure=async e=>{
    e.preventDefault();

    const form=e.currentTarget;

    if(!form.checkValidity()){
      form.reportValidity();
      return false;
    }

    if(!state.authUser){
      toast('Please sign in before placing an order.');
      show('account');
      return false;
    }

    const items=cartItems();

    if(!items.length){
      toast('Your cart is empty.');
      show('cart');
      return false;
    }

    if(items.some(i=>i.product.price==null)){
      toast('Every ordered product needs a confirmed merchant price.');
      return false;
    }

    if(!supabaseReady()){
      toast('BUSIAN database connection is unavailable.');
      return false;
    }

    try{
      const addressId=await createAddressForCheckout();
      const created=await createOrdersFromCart(addressId);

      state.cart=[];
      persistCart();

      toast(`${created.length} order${created.length===1?'':'s'} placed. M-Pesa payment initiation remains the next secure backend step.`);
      show('orders');
    }catch(error){
      console.error('BUSIAN order creation error:',error);
      toast(error.message||'Could not create your order.');
    }

    return false;
  };

  function workspaceShell(title,kicker,body,side,active){
    app.innerHTML=`<section class="page-shell workspace-page"><div class="workspace-header"><div><span class="eyebrow">${esc(kicker)}</span><h1>${esc(title)}</h1></div><button class="secondary" onclick="show('home')">${icon('home')} Shopping</button></div><div class="workspace-layout"><aside class="workspace-sidebar">${side.map(item=>`<button class="${active===item.id?'active':''}" onclick="showWorkspace('${esc(state.role)}','${esc(item.id)}')">${icon(item.icon)} ${esc(item.label)}</button>`).join('')}</aside><main class="workspace-main">${body}</main></div></section>`;
  }

  function renderMerchant(section){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'orders',label:'Orders',icon:'box'},
      {id:'products',label:'Products',icon:'store'},
      {id:'inventory',label:'Inventory',icon:'box'},
      {id:'sales',label:'Sales & payments',icon:'wallet'},
      {id:'profile',label:'Business profile',icon:'user'}
    ];

    if(section==='orders')return merchantOrders();
    if(section==='products')return merchantProducts();
    if(section==='inventory')return merchantInventory();
    if(section==='sales')return merchantSales();
    if(section==='profile')return merchantProfile();

    const body=`<div class="stats-grid"><div class="stat-card"><span>Products</span><strong>${state.merchantProducts.length}</strong><small>Catalogue items</small></div><div class="stat-card"><span>Orders</span><strong>—</strong><small>Live merchant orders</small></div><div class="stat-card"><span>Sales</span><strong>—</strong><small>Payment records</small></div><div class="stat-card"><span>Verification</span><strong>Pending</strong><small>Merchant approval</small></div></div><div class="workspace-card"><h2>Merchant workspace</h2><p>Manage your products, prices, stock, orders and business profile.</p><div class="feature-list"><span>${icon('store')} Catalogue management</span><span>${icon('box')} Order management</span><span>${icon('wallet')} Sales & payments</span><span>${icon('shield')} Verification</span></div><div class="form-actions"><button class="primary" onclick="showWorkspace('merchant','products')">${icon('plus')} Add or manage products</button></div></div>`;

    workspaceShell('Merchant dashboard','MY BUSINESS',body,side,section);
  }

  async function merchantOrders(){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'orders',label:'Orders',icon:'box'},
      {id:'products',label:'Products',icon:'store'},
      {id:'inventory',label:'Inventory',icon:'box'},
      {id:'sales',label:'Sales & payments',icon:'wallet'},
      {id:'profile',label:'Business profile',icon:'user'}
    ];

    const {orders}=await loadMerchantOrders();

    const body=`<div class="workspace-card"><h2>Customer orders</h2>${orders.length?`<div class="management-list">${orders.map(o=>`<div><span><strong>${esc(o.order_number||o.id.slice(0,8))}</strong><small>${esc(o.status||'pending')} · ${money(o.total_amount)}</small></span><span class="status-badge pending">${esc(o.status||'pending')}</span></div>`).join('')}</div>`:`<div class="empty-state compact"><strong>No orders yet.</strong><p>Customer orders will appear here after checkout.</p></div>`}</div>`;

    workspaceShell('Orders','MERCHANT',body,side,'orders');
  }

  async function merchantProducts(){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'orders',label:'Orders',icon:'box'},
      {id:'products',label:'Products',icon:'store'},
      {id:'inventory',label:'Inventory',icon:'box'},
      {id:'sales',label:'Sales & payments',icon:'wallet'},
      {id:'profile',label:'Business profile',icon:'user'}
    ];

    const merchant=await currentMerchant();

    if(!merchant){
      const body=`<div class="workspace-card"><div class="section-heading"><span class="eyebrow">MERCHANT SETUP</span><h2>Business profile required</h2><p>Create your merchant business profile before adding products.</p></div><div class="form-actions"><button class="primary" onclick="showWorkspace('merchant','profile')">Set up business profile</button></div></div>`;

      workspaceShell('Products','MERCHANT',body,side,'products');
      return;
    }

    state.merchantProducts=await loadOwnProducts(merchant.id);

    const body=`<div class="workspace-card"><div class="section-heading"><span class="eyebrow">CATALOGUE</span><h2>My products</h2><p>Add products, set prices and manage availability for your store.</p></div><div class="form-actions"><button class="primary" onclick="openProductEditor()">${icon('plus')} Add product</button></div></div>${state.merchantProducts.length?`<div class="management-list product-management-list">${state.merchantProducts.map(p=>`<div><span><strong>${esc(p.name)}</strong><small>${esc(p.category)} · ${p.published?'Published':'Draft'} · ${p.available?'Available':'Unavailable'}</small></span><span><strong>${money(p.price)}</strong><small>Stock: ${esc(p.stock??0)}</small></span><button class="secondary small" onclick="openProductEditor('${esc(p.id)}')">${icon('edit')} Edit</button></div>`).join('')}</div>`:`<div class="empty-state compact"><strong>No products yet.</strong><p>Add your first product with a price and stock quantity.</p></div>`}`;

    workspaceShell('Products','MERCHANT',body,side,'products');
  }

  window.openProductEditor=async productId=>{
    const product=state.merchantProducts.find(p=>p.id===productId);

    if(!product && productId){
      toast('Product could not be found.');
      return;
    }

    const draft=product||{};

    app.innerHTML=`<section class="page-shell workspace-page"><div class="workspace-header"><div><span class="eyebrow">MERCHANT CATALOGUE</span><h1>${product?'Edit product':'Add product'}</h1></div><button class="secondary" onclick="showWorkspace('merchant','products')">← Back to products</button></div><div class="workspace-card"><form onsubmit="return saveProductDraft(event,'${esc(productId||'')}')"><div class="form-grid"><div class="form-field full"><label for="product-name">Product name</label><input id="product-name" required value="${esc(draft.name||'')}"></div><div class="form-field"><label for="product-category">Category</label><select id="product-category" required>${d.categories.map(c=>`<option value="${esc(c.dbId||c.id)}" ${draft.dbCategoryId===c.dbId||draft.categoryId===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div class="form-field"><label for="product-price">Price (KES)</label><input id="product-price" type="number" min="0" step="0.01" required value="${esc(draft.price??'')}"></div><div class="form-field"><label for="product-stock">Stock quantity</label><input id="product-stock" type="number" min="0" step="1" required value="${esc(draft.stock??0)}"></div><div class="form-field"><label for="product-sku">SKU</label><input id="product-sku" value="${esc(draft.sku||'')}"></div><div class="form-field full"><label for="product-description">Description</label><textarea id="product-description">${esc(draft.description||'')}</textarea></div><div class="form-field full"><label for="product-image">Image URL</label><input id="product-image" type="url" value="${esc(draft.image||'')}" placeholder="https://..."></div></div><div id="product-save-status" class="save-status" style="margin-top:16px"></div><div class="form-actions"><button class="primary" type="submit">${icon('check')} Save product</button><button class="secondary" type="button" onclick="showWorkspace('merchant','products')">Cancel</button></div></form></div></section>`;
  };

  window.saveProductDraft=async(e,productId)=>{
    e.preventDefault();

    if(!state.authUser){
      toast('Please sign in first.');
      return false;
    }

    if(!supabaseReady()){
      toast('BUSIAN database connection is unavailable.');
      return false;
    }

    const merchant=await currentMerchant();

    if(!merchant){
      toast('Set up your merchant business profile first.');
      showWorkspace('merchant','profile');
      return false;
    }

    const name=document.getElementById('product-name').value.trim();
    const categoryId=document.getElementById('product-category').value;
    const price=Number(document.getElementById('product-price').value);
    const stock=Number(document.getElementById('product-stock').value);
    const sku=document.getElementById('product-sku').value.trim();
    const description=document.getElementById('product-description').value.trim();
    const image_url=document.getElementById('product-image').value.trim();

    if(!name||!categoryId||Number.isNaN(price)||price<0||Number.isNaN(stock)||stock<0){
      toast('Complete the product name, category, price and stock.');
      return false;
    }

    const payload={
      merchant_id:merchant.id,
      category_id:categoryId,
      name,
      description,
      price,
      currency:'KES',
      stock_quantity:stock,
      image_url:image_url||null,
      sku:sku||null,
      is_available:stock>0,
      is_published:true
    };

    try{
      let result;

      if(productId){
        result=await window.busianSupabase
          .from('products')
          .update(payload)
          .eq('id',productId)
          .eq('merchant_id',merchant.id);
      }else{
        result=await window.busianSupabase
          .from('products')
          .insert(payload);
      }

      if(result.error) throw result.error;

      toast(productId?'Product updated successfully.':'Product added successfully.');
      state.merchantProducts=await loadOwnProducts(merchant.id);
      await loadLiveCatalog();
      showWorkspace('merchant','products');

    }catch(error){
      console.error('BUSIAN product save error:',error);
      toast(error.message||'Could not save product.');
    }

    return false;
  };

  async function merchantInventory(){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'orders',label:'Orders',icon:'box'},
      {id:'products',label:'Products',icon:'store'},
      {id:'inventory',label:'Inventory',icon:'box'},
      {id:'sales',label:'Sales & payments',icon:'wallet'},
      {id:'profile',label:'Business profile',icon:'user'}
    ];

    const merchant=await currentMerchant();
    const products=merchant?await loadOwnProducts(merchant.id):[];

    const body=`<div class="workspace-card"><h2>Inventory</h2><p>Stock is controlled from the merchant product catalogue.</p><div class="form-actions"><button class="primary" onclick="showWorkspace('merchant','products')">Manage products</button></div>${products.length?`<div class="management-list">${products.map(p=>`<div><span><strong>${esc(p.name)}</strong><small>${esc(p.category)}</small></span><span class="status-badge ${Number(p.stock)>0?'success':'danger'}">Stock ${esc(p.stock??0)}</span></div>`).join('')}</div>`:`<div class="empty-state compact"><strong>No inventory records yet.</strong></div>`}</div>`;

    workspaceShell('Inventory','MERCHANT',body,side,'inventory');
  }

  async function merchantSales(){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'orders',label:'Orders',icon:'box'},
      {id:'products',label:'Products',icon:'store'},
      {id:'inventory',label:'Inventory',icon:'box'},
      {id:'sales',label:'Sales & payments',icon:'wallet'},
      {id:'profile',label:'Business profile',icon:'user'}
    ];

    const {orders}=await loadMerchantOrders();
    const gross=orders.reduce((n,o)=>n+Number(o.total_amount||0),0);

    const body=`<div class="stats-grid"><div class="stat-card"><span>Orders</span><strong>${orders.length}</strong><small>Live Supabase orders</small></div><div class="stat-card"><span>Gross order value</span><strong>${money(gross)}</strong><small>Before settlement</small></div></div><div class="workspace-card"><h2>Sales & payments</h2><p>Payment records remain controlled by the secure backend. This screen currently reports live order value only.</p></div>`;

    workspaceShell('Sales & payments','MERCHANT',body,side,'sales');
  }

  async function merchantProfile(){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'orders',label:'Orders',icon:'box'},
      {id:'products',label:'Products',icon:'store'},
      {id:'inventory',label:'Inventory',icon:'box'},
      {id:'sales',label:'Sales & payments',icon:'wallet'},
      {id:'profile',label:'Business profile',icon:'user'}
    ];

    const merchant=await currentMerchant();
    const draft=merchant||state.drafts.profile||{};

    const body=`<div class="workspace-card"><div class="section-heading"><span class="eyebrow">MERCHANT PROFILE</span><h2>Business profile</h2><p>Your merchant record is stored in Supabase.</p></div><form onsubmit="return saveMerchantProfile(event)"><div class="form-grid"><div class="form-field"><label for="biz-name">Business name</label><input id="biz-name" required value="${esc(draft.business_name||draft.name||'')}"></div><div class="form-field"><label for="biz-phone">Business phone</label><input id="biz-phone" type="tel" required value="${esc(draft.phone||'')}"></div><div class="form-field"><label for="biz-category">Business category</label><select id="biz-category" required>${d.categories.map(c=>`<option ${draft.category===c.name?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div class="form-field"><label for="biz-location">Business location</label><input id="biz-location" required value="${esc(draft.location||'')}"></div><div class="form-field full"><label for="biz-description">Business description</label><textarea id="biz-description">${esc(draft.description||'')}</textarea></div></div><div id="profile-save-status" class="save-status" style="margin-top:16px"></div><div class="form-actions"><button class="primary" type="submit">${icon('check')} Save business profile</button></div></form></div>`;

    workspaceShell('Business profile','MERCHANT',body,side,'profile');
  }

  window.saveMerchantProfile=async e=>{
    e.preventDefault();

    if(!state.authUser){
      toast('Please sign in first.');
      return false;
    }

    const payload={
      owner_id:state.authUser.id,
      business_name:document.getElementById('biz-name').value.trim(),
      phone:document.getElementById('biz-phone').value.trim(),
      email:state.authUser.email||null,
      category:document.getElementById('biz-category').value,
      location:document.getElementById('biz-location').value.trim(),
      county:'Busia County',
      description:document.getElementById('biz-description').value.trim()
    };

    if(!payload.business_name||!payload.phone||!payload.category||!payload.location){
      toast('Complete the required business fields.');
      return false;
    }

    const existing=await currentMerchant();

    const query=existing
      ? window.busianSupabase.from('merchants').update(payload).eq('id',existing.id).eq('owner_id',state.authUser.id)
      : window.busianSupabase.from('merchants').insert(payload);

    const {error}=await query;

    if(error){
      console.error('BUSIAN merchant save error:',error);
      toast(error.message||'Could not save business profile.');
      return false;
    }

    toast('Business profile saved. It remains subject to BUSIAN verification.');

    await loadLiveCatalog();
    showWorkspace('merchant','profile');

    return false;
  };

  function renderRider(section){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'deliveries',label:'Available deliveries',icon:'truck'},
      {id:'active',label:'Active delivery',icon:'truck'},
      {id:'earnings',label:'Earnings',icon:'wallet'},
      {id:'profile',label:'Profile',icon:'user'}
    ];

    if(section==='deliveries')return riderDeliveries();
    if(section==='active')return riderActive();
    if(section==='earnings')return riderEarnings();
    if(section==='profile')return riderProfile();

    const body=`<div class="stats-grid"><div class="stat-card"><span>Available jobs</span><strong>—</strong><small>Live delivery queue</small></div><div class="stat-card"><span>Active delivery</span><strong>—</strong><small>Current assignment</small></div><div class="stat-card"><span>Today's earnings</span><strong>—</strong><small>Completed deliveries</small></div><div class="stat-card"><span>Status</span><strong>Offline</strong><small>Will be live after authentication</small></div></div><div class="workspace-card"><h2>Rider workflow</h2><div class="step-flow"><button><strong>1. Accept</strong><small>Accept an assigned job</small></button><button><strong>2. Pickup</strong><small>Confirm merchant pickup</small></button><button><strong>3. Deliver</strong><small>Start the customer delivery</small></button><button><strong>4. Complete</strong><small>Confirm delivery</small></button></div></div>`;

    workspaceShell('Rider dashboard','MY RIDER ACCOUNT',body,side,section);
  }

  async function riderDeliveries(){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'deliveries',label:'Available deliveries',icon:'truck'},
      {id:'active',label:'Active delivery',icon:'truck'},
      {id:'earnings',label:'Earnings',icon:'wallet'},
      {id:'profile',label:'Profile',icon:'user'}
    ];

    const rows=await loadRiderAssignments();
    const available=rows.filter(r=>r.status==='pending');

    const body=`<div class="workspace-card"><h2>Available deliveries</h2>${available.length?`<div class="management-list">${available.map(r=>`<div><span><strong>${esc(r.orders?.order_number||r.order_id.slice(0,8))}</strong><small>${esc(r.orders?.merchants?.business_name||'Merchant')} · ${money(r.orders?.total_amount)}</small></span><button class="primary small" onclick="updateDelivery('${esc(r.id)}','accepted')">Accept</button></div>`).join('')}</div>`:`<div class="empty-state compact"><div class="empty-icon">${icon('truck')}</div><strong>No delivery assignments.</strong><p>Live rider assignments will appear here.</p></div>`}</div>`;

    workspaceShell('Available deliveries','RIDER',body,side,'deliveries');
  }

  window.updateDelivery=async(id,status)=>{
    if(!supabaseReady())return;

    const now=new Date().toISOString();
    const patch={status};

    if(status==='accepted')patch.accepted_at=now;
    if(status==='picked_up')patch.picked_up_at=now;
    if(status==='out_for_delivery')patch.out_for_delivery_at=now;
    if(status==='delivered')patch.delivered_at=now;

    const {error}=await window.busianSupabase
      .from('delivery_assignments')
      .update(patch)
      .eq('id',id)
      .eq('rider_id',state.authUser.id);

    if(error){
      toast(error.message||'Could not update delivery.');
      return;
    }

    toast('Delivery status updated.');
    showWorkspace('rider','deliveries');
  };

  async function riderActive(){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'deliveries',label:'Available deliveries',icon:'truck'},
      {id:'active',label:'Active delivery',icon:'truck'},
      {id:'earnings',label:'Earnings',icon:'wallet'},
      {id:'profile',label:'Profile',icon:'user'}
    ];

    const rows=await loadRiderAssignments();
    const active=rows.find(r=>['accepted','picked_up','out_for_delivery'].includes(r.status));

    const body=`<div class="workspace-card"><h2>Active delivery</h2>${active?`<div class="management-list"><div><span><strong>${esc(active.orders?.order_number||active.order_id.slice(0,8))}</strong><small>${esc(active.status)} · ${esc(active.orders?.merchants?.business_name||'Merchant')}</small></span><div class="form-actions"><button class="secondary small" onclick="updateDelivery('${esc(active.id)}','picked_up')">Picked up</button><button class="primary small" onclick="updateDelivery('${esc(active.id)}','out_for_delivery')">Out for delivery</button><button class="primary small" onclick="updateDelivery('${esc(active.id)}','delivered')">Delivered</button></div></div></div>`:`<div class="empty-state compact"><strong>No active delivery.</strong><p>Accept a delivery from the available jobs.</p></div>`}</div>`;

    workspaceShell('Active delivery','RIDER',body,side,'active');
  }

  async function riderEarnings(){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'deliveries',label:'Available deliveries',icon:'truck'},
      {id:'active',label:'Active delivery',icon:'truck'},
      {id:'earnings',label:'Earnings',icon:'wallet'},
      {id:'profile',label:'Profile',icon:'user'}
    ];

    const rows=await loadRiderAssignments();
    const delivered=rows.filter(r=>r.status==='delivered');

    const body=`<div class="stats-grid"><div class="stat-card"><span>Completed</span><strong>${delivered.length}</strong><small>Delivered orders</small></div><div class="stat-card"><span>Earnings</span><strong>—</strong><small>Settlement records remain backend-controlled</small></div></div><div class="workspace-card"><h2>Earnings history</h2><p>Delivery completion is live. Financial settlement will be read from commission/payment records when available.</p></div>`;

    workspaceShell('Earnings','RIDER',body,side,'earnings');
  }

  function riderProfile(){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'deliveries',label:'Available deliveries',icon:'truck'},
      {id:'active',label:'Active delivery',icon:'truck'},
      {id:'earnings',label:'Earnings',icon:'wallet'},
      {id:'profile',label:'Profile',icon:'user'}
    ];

    const body=`<div class="workspace-card"><h2>Rider profile</h2><p>Your rider identity is tied to the authenticated BUSIAN account. Vehicle and verification fields remain in the existing database workflow.</p></div>`;

    workspaceShell('Rider profile','RIDER',body,side,'profile');
  }

  function renderAgent(section){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'acquisition',label:'Merchant acquisition',icon:'store'},
      {id:'referrals',label:'My referrals',icon:'user'},
      {id:'earnings',label:'Commission',icon:'wallet'},
      {id:'profile',label:'Profile',icon:'user'}
    ];

    if(section==='acquisition')return agentAcquisition();
    if(section==='referrals')return agentReferrals();
    if(section==='earnings')return agentEarnings();

    const body=`<div class="stats-grid"><div class="stat-card"><span>Merchants onboarded</span><strong>${state.fieldLeads.length}</strong><small>Local acquisition</small></div><div class="stat-card"><span>Pending review</span><strong>${state.fieldLeads.length}</strong><small>Until Supabase verification</small></div></div><div class="workspace-card"><h2>Merchant acquisition</h2><p>Field agents help BUSIAN reach physical businesses, collect onboarding information and support product/catalogue setup.</p><button class="primary" onclick="showWorkspace('agent','acquisition')">${icon('plus')} Add merchant lead</button></div>`;

    workspaceShell('Field Agent dashboard','BUSIAN FIELD OPERATIONS',body,side,section);
  }

  function agentAcquisition(){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'acquisition',label:'Merchant acquisition',icon:'store'},
      {id:'referrals',label:'My referrals',icon:'user'},
      {id:'earnings',label:'Commission',icon:'wallet'},
      {id:'profile',label:'Profile',icon:'user'}
    ];

    const body=`<div class="workspace-card"><div class="section-heading"><span class="eyebrow">MERCHANT ACQUISITION</span><h2>Register a local merchant lead</h2><p>Capture the lead accurately. Verification and activation remain controlled by BUSIAN operations.</p></div><form onsubmit="return saveLead(event)"><div class="form-grid"><div class="form-field"><label for="lead-name">Business name</label><input id="lead-name" required></div><div class="form-field"><label for="lead-phone">Business phone</label><input id="lead-phone" type="tel" required></div><div class="form-field"><label for="lead-category">Category</label><select id="lead-category" required>${d.categories.map(c=>`<option>${esc(c.name)}</option>`).join('')}</select></div><div class="form-field"><label for="lead-location">Location</label><input id="lead-location" required placeholder="Town / area"></div><div class="form-field full"><label for="lead-notes">Notes</label><textarea id="lead-notes" placeholder="Products, store size, owner contact, onboarding notes..."></textarea></div></div><div class="form-actions"><button class="primary" type="submit">${icon('check')} Save merchant lead</button></div></form></div>`;

    workspaceShell('Merchant acquisition','FIELD AGENT',body,side,'acquisition');
  }

  window.saveLead=e=>{
    e.preventDefault();

    const lead={
      id:`lead-${Date.now()}`,
      name:document.getElementById('lead-name').value.trim(),
      phone:document.getElementById('lead-phone').value.trim(),
      category:document.getElementById('lead-category').value,
      location:document.getElementById('lead-location').value.trim(),
      notes:document.getElementById('lead-notes').value.trim(),
      status:'Pending verification',
      createdAt:new Date().toISOString()
    };

    if(!lead.name||!lead.phone||!lead.location){
      toast('Complete the required merchant fields.');
      return false;
    }

    state.fieldLeads.push(lead);
    safeSet('busian_field_leads',JSON.stringify(state.fieldLeads));

    toast('Merchant lead saved.');
    showWorkspace('agent','referrals');

    return false;
  };

  function agentReferrals(){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'acquisition',label:'Merchant acquisition',icon:'store'},
      {id:'referrals',label:'My referrals',icon:'user'},
      {id:'earnings',label:'Commission',icon:'wallet'},
      {id:'profile',label:'Profile',icon:'user'}
    ];

    const body=`<div class="workspace-card"><h2>My merchant referrals</h2>${state.fieldLeads.length?`<div class="table-list"><div class="table-row header"><span>Business</span><span>Category</span><span>Status</span><span>Location</span></div>${state.fieldLeads.map(l=>`<div class="table-row"><strong>${esc(l.name)}</strong><span>${esc(l.category)}</span><span class="status-badge pending">${esc(l.status)}</span><span>${esc(l.location)}</span></div>`).join('')}</div>`:`<div class="empty-state compact"><strong>No merchant leads yet.</strong><p>Use Merchant acquisition to register businesses you are helping onboard.</p></div>`}</div>`;

    workspaceShell('My referrals','FIELD AGENT',body,side,'referrals');
  }

  function agentEarnings(){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'acquisition',label:'Merchant acquisition',icon:'store'},
      {id:'referrals',label:'My referrals',icon:'user'},
      {id:'earnings',label:'Commission',icon:'wallet'},
      {id:'profile',label:'Profile',icon:'user'}
    ];

    const body=`<div class="workspace-card"><h2>Commission</h2><p>Agent commissions will be calculated from verified merchant acquisition records and the configured BUSIAN commission rules.</p><div class="empty-state compact"><strong>No commission records yet.</strong></div></div>`;

    workspaceShell('Commission','FIELD AGENT',body,side,'earnings');
  }

  async function renderAdmin(section){
    const side=[
      {id:'dashboard',label:'Dashboard',icon:'home'},
      {id:'users',label:'Users',icon:'user'},
      {id:'merchants',label:'Merchants',icon:'store'},
      {id:'orders',label:'Orders & deliveries',icon:'box'},
      {id:'payments',label:'Payments',icon:'wallet'},
      {id:'verification',label:'Verification',icon:'shield'},
      {id:'commissions',label:'Commissions',icon:'wallet'}
    ];

    const snap=await loadAdminSnapshot();
    let body='';

    if(section==='merchants'||section==='verification')
      body=`<div class="workspace-card"><h2>Merchant verification</h2><p>Live merchant records and verification status are controlled by Supabase.</p><div class="empty-state compact"><strong>${esc(String(snap.merchants??'—'))} merchant records.</strong></div></div>`;
    else if(section==='orders')
      body=`<div class="workspace-card"><h2>Orders & deliveries</h2><p>Live order records are available to authorized admin accounts.</p><div class="empty-state compact"><strong>${esc(String(snap.orders??'—'))} order records.</strong></div></div>`;
    else if(section==='payments')
      body=`<div class="workspace-card"><h2>Payments</h2><p>Payment writes and M-Pesa callbacks remain backend-controlled.</p><div class="empty-state compact"><strong>${esc(String(snap.payments??'—'))} payment records.</strong></div></div>`;
    else if(section==='commissions')
      body=`<div class="workspace-card"><h2>Commissions</h2><p>Commission records remain backend-controlled and are not fabricated in the frontend.</p></div>`;
    else if(section==='users')
      body=`<div class="workspace-card"><h2>Users & roles</h2><p>Live profile count from Supabase.</p><div class="empty-state compact"><strong>${esc(String(snap.users??'—'))} profiles.</strong></div></div>`;
    else
      body=`<div class="stats-grid"><div class="stat-card"><span>Users</span><strong>${esc(String(snap.users??'—'))}</strong><small>Supabase profiles</small></div><div class="stat-card"><span>Merchants</span><strong>${esc(String(snap.merchants??'—'))}</strong><small>Merchant records</small></div><div class="stat-card"><span>Orders</span><strong>${esc(String(snap.orders??'—'))}</strong><small>Order records</small></div><div class="stat-card"><span>Payments</span><strong>${esc(String(snap.payments??'—'))}</strong><small>Payment records</small></div></div><div class="workspace-card"><h2>BUSIAN operations</h2><div class="feature-list"><span>${icon('shield')} Approve verified merchants</span><span>${icon('truck')} Monitor delivery assignments</span><span>${icon('wallet')} Reconcile payments</span><span>${icon('wallet')} Configure commissions</span></div></div>`;

    workspaceShell('Admin controls','BUSIAN ADMIN',body,side,section);
  }

  function setupAccessibility(){
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&state.drawer)closeDrawer();

      if(e.key==='Tab'&&state.drawer){
        const drawer=document.getElementById('mobile-drawer');

        const focusables=drawer?.querySelectorAll(
          'button,a,input,select,textarea,[tabindex]:not([tabindex="-1"])'
        );

        if(!focusables||!focusables.length)return;

        const first=focusables[0];
        const last=focusables[focusables.length-1];

        if(e.shiftKey&&document.activeElement===first){
          e.preventDefault();
          last.focus();
        }else if(!e.shiftKey&&document.activeElement===last){
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  async function boot(){
    setupAccessibility();
    updateCartCount();
    renderDrawer();

    await refreshAuthState();

    if(window.busianOnAuthStateChange){
      window.busianOnAuthStateChange(async (_event, session)=>{
        state.authSession=session||null;
        state.authUser=session?.user||null;

        if(state.authUser?.id)
          await refreshAuthState();

        state.authReady=true;
        updateAuthUI();

        if(!state.authUser&&document.querySelector('.account-page'))
          renderAccount();
      });
    }

    const categories=await window.loadBusianCategories();

    if(categories&&categories.length){
      d.categories=categories.map(row=>{
        const ui=localCategoryPresentation(row);

        return {
          ...ui,
          id:row.slug||normalizeCategoryKey(row.name),
          dbId:row.id,
          name:row.name,
          sort_order:row.sort_order,
          image:ui.image||categoryImageFor(row)
        };
      });
    }

    await loadLiveCatalog();

    if(state.authUser&&['merchant','rider','agent','admin'].includes(state.role))
      showWorkspace(state.role);
    else
      renderHome();
  }

  window.addEventListener('DOMContentLoaded',boot);

  if(document.readyState!=='loading')
    boot();

})();
