const STEP_LABELS = ['Select Guest','Choose Rate','Add-Ons','Confirm'];

function renderWizardSteps() {
  const container = document.getElementById('wizard-steps');
  container.innerHTML = STEP_LABELS.map((label, i) => {
    const step = i + 1;
    const state = step < wzStep ? 'done' : step === wzStep ? 'active' : 'pending';
    const lineState = step < wzStep ? 'done' : '';
    const icon = state === 'done' ? '✓' : step;
    return `
      <div class="step-item">
        <div class="step-node">
          <div class="step-circle ${state}">${icon}</div>
          <div class="step-label ${state==='active'?'active-label':''}">
            ${label}<small>${state==='active'?'Current step':state==='done'?'Completed':'Pending'}</small>
          </div>
        </div>
        ${step < STEP_LABELS.length ? `<div class="step-line ${lineState}"></div>` : ''}
      </div>`;
  }).join('');
}

function renderRateGrid(containerId, rates) {
  const container = document.getElementById(containerId);
  container.innerHTML = rates.map(r => `
    <div class="rate-card ${r.locked?'locked':''} ${wzRate?.id===r.id?'selected':''}" onclick="${r.locked?'showToast(\'This plan requires verification\',\'warning\')':'selectRate(\''+r.id+'\')'}">
      ${r.popular ? '<span class="rate-popular">Popular</span>' : ''}
      ${r.locked  ? '<span class="rate-lock">🔒</span>' : ''}
      <div class="rate-type">${r.type}</div>
      <div class="rate-name">${r.name}</div>
      <div class="rate-duration">${r.duration}</div>
      <div class="rate-price">₱${r.price.toLocaleString()}<span>/session</span></div>
      <div class="rate-note">${r.note}</div>
      <div class="rate-check">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M2 6l3 3 5-5"/></svg>
      </div>
    </div>`).join('');
}

function renderAddonGrid() {
  const container = document.getElementById('addon-grid');
  container.innerHTML = wzAddons.map((a, i) => `
    <div class="addon-card ${a.qty > 0 ? 'selected' : ''}" id="addon-${a.id}">
      <span class="addon-icon">${a.icon}</span>
      <div style="flex:1;min-width:0;">
        <div class="addon-name">${a.name}</div>
        <div class="addon-desc">${a.desc}</div>
      </div>
      ${a.multi
        ? `<div class="addon-qty-wrap">
             <button class="qty-btn" onclick="event.stopPropagation();changeAddonQty(${i},-1)">−</button>
             <span class="qty-val" id="qty-${a.id}">${a.qty}</span>
             <button class="qty-btn" onclick="event.stopPropagation();changeAddonQty(${i},+1)">+</button>
             <span class="addon-price">₱${a.price}</span>
           </div>`
        : `<div class="addon-qty-wrap">
             <button class="qty-btn" onclick="event.stopPropagation();toggleAddon(${i})">${a.qty>0?'−':'+' }</button>
             <span class="addon-price">₱${a.price}</span>
           </div>`}
    </div>`).join('');
  updateAddonSubtotal();
}

function toggleAddon(idx) {
  wzAddons[idx].qty = wzAddons[idx].qty > 0 ? 0 : 1;
  renderAddonGrid();
}

function changeAddonQty(idx, delta) {
  wzAddons[idx].qty = Math.max(0, wzAddons[idx].qty + delta);
  renderAddonGrid();
}

function updateAddonSubtotal() {
  const addonCost = wzAddons.reduce((s,a) => s + a.price * a.qty, 0);
  const wifiCost  = wzWifi ? 50 : 0;
  const rateCost  = wzRate ? wzRate.price : 0;
  document.getElementById('wz-addon-total').textContent = '₱' + (rateCost + addonCost + wifiCost).toFixed(2);
}

function toggleWifi() {
  wzWifi = !wzWifi;
  const sw = document.getElementById('wifi-switch');
  const tg = document.getElementById('wifi-toggle');
  sw.classList.toggle('on', wzWifi);
  tg.classList.toggle('active', wzWifi);
  updateAddonSubtotal();
  if (wzStep === 4) buildSummary();
}

function selectRate(id) {
  const all = [...RATES.hourly, ...RATES.daily, ...RATES.monthly];
  wzRate = all.find(r => r.id === id) || null;
  renderRateGrid('rate-grid-hourly',  RATES.hourly);
  renderRateGrid('rate-grid-daily',   RATES.daily);
  renderRateGrid('rate-grid-monthly', RATES.monthly);
  document.getElementById('wz-rate-label').textContent = wzRate ? `${wzRate.name} · ₱${wzRate.price}` : '—';
}

function searchGuests(val) {
  const dd = document.getElementById('guest-dropdown');
  if (!val.trim()) { dd.classList.add('hidden'); return; }
  const results = MOCK_GUESTS.filter(g => g.name.toLowerCase().includes(val.toLowerCase()) || g.school.toLowerCase().includes(val.toLowerCase()));
  if (!results.length) { dd.classList.add('hidden'); return; }
  dd.innerHTML = results.map(g => `
    <div class="guest-result" onclick="selectGuest(${g.id})">
      <div class="guest-avatar-sm">${g.name.charAt(0)}</div>
      <div>
        <div class="guest-result-name">${g.name}</div>
        <div class="guest-result-meta">${g.school} · ${g.email}</div>
      </div>
      <div class="guest-coins-chip">★ ${g.coins} coins</div>
    </div>`).join('');
  dd.classList.remove('hidden');
}

function selectGuest(id) {
  wzGuest = MOCK_GUESTS.find(g => g.id === id);
  document.getElementById('guest-dropdown').classList.add('hidden');
  document.getElementById('guest-search-input').value = '';
  const disp = document.getElementById('selected-guest-display');
  disp.innerHTML = `
    <div class="selected-guest-card">
      <div class="selected-guest-avatar">${wzGuest.name.charAt(0)}</div>
      <div style="flex:1;">
        <div class="guest-detail-name">${wzGuest.name}</div>
        <div class="guest-detail-meta">${wzGuest.school} · ${wzGuest.email}</div>
        <div class="guest-detail-coins">★ ${wzGuest.coins} HR Coins available</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="clearGuest()">Change</button>
    </div>`;
  disp.classList.remove('hidden');
}

function clearGuest() {
  wzGuest = null;
  document.getElementById('selected-guest-display').classList.add('hidden');
}

function getNewGuestFromForm() {
  const fname  = document.getElementById('f-fname').value.trim();
  const lname  = document.getElementById('f-lname').value.trim();
  const email  = document.getElementById('f-email').value.trim();
  const mobile = document.getElementById('f-mobile').value.trim();
  const school = document.getElementById('f-school').value.trim();
  const course = document.getElementById('f-course').value.trim();
  if (!fname || !lname) return null;
  return { id: Date.now(), name: `${fname} ${lname}`, email, mobile, school, course, coins: 0 };
}

function wizardNext() {
  if (wzStep === 1) {
    if (!wzGuest) {
      const g = getNewGuestFromForm();
      if (!g) { showToast('Enter first and last name to continue', 'warning'); return; }
      wzGuest = g;
    }
  }
  if (wzStep === 2 && !wzRate) { showToast('Select a plan to continue', 'warning'); return; }
  if (wzStep < 4) { wzStep++; renderWizard(); }
}

function wizardPrev() {
  if (wzStep > 1) { wzStep--; renderWizard(); }
}

function renderWizard() {
  renderWizardSteps();
  [1,2,3,4].forEach(s => {
    document.getElementById('wz-step-' + s).classList.toggle('hidden', s !== wzStep);
  });
  if (wzStep === 2) {
    renderRateGrid('rate-grid-hourly',  RATES.hourly);
    renderRateGrid('rate-grid-daily',   RATES.daily);
    renderRateGrid('rate-grid-monthly', RATES.monthly);
  }
  if (wzStep === 3) renderAddonGrid();
  if (wzStep === 4) buildSummary();
}

function resetWizard() {
  wzStep = 1; wzGuest = null; wzRate = null;
  wzAddons = JSON.parse(JSON.stringify(ADDONS));
  wzWifi = false; wzMembership = 'none'; wzPromo = null; wzCoinsRedeemed = 0;
  document.getElementById('guest-search-input').value = '';
  document.getElementById('selected-guest-display').classList.add('hidden');
  ['f-fname','f-lname','f-email','f-mobile','f-school','f-course'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
  renderWizard();
}

function calcWizardTotals() {
  const base     = wzRate ? wzRate.price : 0;
  const addonAmt = wzAddons.reduce((s,a) => s + a.price * a.qty, 0);
  const wifiAmt  = wzWifi ? 50 : 0;
  const subtotal = base + addonAmt + wifiAmt;

  let membershipDisc = 0;
  if (wzMembership !== 'none') membershipDisc = subtotal * MEMBERSHIP_DISCOUNTS[wzMembership].pct;

  let promoDisc = 0;
  if (wzPromo) {
    if (wzPromo.type === 'pct') promoDisc = subtotal * wzPromo.discount;
    else promoDisc = wzPromo.discount;
  }

  const coinsDisc = wzCoinsRedeemed;
  const totalDisc = membershipDisc + promoDisc + coinsDisc;
  const grand     = Math.max(0, subtotal - totalDisc);
  const coinsEarned = Math.floor(grand / 100) * 2;

  return { base, addonAmt, wifiAmt, subtotal, membershipDisc, promoDisc, coinsDisc, totalDisc, grand, coinsEarned };
}

function buildSummary() {
  const t = calcWizardTotals();
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-PH',{month:'2-digit',day:'2-digit',year:'numeric'});
  const timeStr = today.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'});

  let durationMins = 60;
  if (wzRate) {
    if (wzRate.id==='h1') durationMins=60;
    else if (wzRate.id==='h5') durationMins=300;
    else if (wzRate.id==='h10') durationMins=600;
    else if (wzRate.id==='d1') durationMins=14*60;
    else if (wzRate.id==='m3') durationMins=3*24*60;
    else durationMins=30*24*60;
  }
  const endTime = new Date(today.getTime() + durationMins * 60000);
  const endStr  = endTime.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'});

  wzRefNo = 'BN-' + (200000000 + Math.floor(Math.random()*99999999));

  const rows = [];
  rows.push({ label:'Base plan', val: `₱${t.base.toFixed(2)}` });
  if (wzWifi)     rows.push({ label:'Wi-Fi access', val: `₱50.00` });
  wzAddons.filter(a=>a.qty>0).forEach(a => rows.push({ label:`${a.name} ×${a.qty}`, val:`₱${(a.price*a.qty).toFixed(2)}` }));
  if (t.membershipDisc) rows.push({ label:`${MEMBERSHIP_DISCOUNTS[wzMembership].label}`, val:`-₱${t.membershipDisc.toFixed(2)}`, discount:true });
  if (t.promoDisc)      rows.push({ label:`Promo: ${wzPromo.label}`, val:`-₱${t.promoDisc.toFixed(2)}`, discount:true });
  if (t.coinsDisc)      rows.push({ label:'Coins redeemed', val:`-₱${t.coinsDisc.toFixed(2)}`, discount:true });

  document.getElementById('summary-rows').innerHTML = rows.map(r => `
    <div class="summary-row">
      <span class="label">${r.label}</span>
      <span class="val ${r.discount?'discount':''}">${r.val}</span>
    </div>`).join('');

  document.getElementById('summary-grand-total').textContent = '₱' + t.grand.toLocaleString('en-PH',{minimumFractionDigits:2});
  document.getElementById('wz-grand-total').textContent = '₱' + t.grand.toLocaleString('en-PH',{minimumFractionDigits:2});

  document.getElementById('receipt-ref').textContent      = wzRefNo;
  document.getElementById('receipt-guest').textContent    = wzGuest ? wzGuest.name : '—';
  document.getElementById('receipt-plan').textContent     = wzRate ? wzRate.name : '—';
  document.getElementById('receipt-date').textContent     = dateStr;
  document.getElementById('receipt-duration').textContent = wzRate ? wzRate.duration : '—';
  document.getElementById('receipt-start').textContent    = timeStr;
  document.getElementById('receipt-end').textContent      = endStr;
  document.getElementById('barcode-text').textContent     = wzRefNo;

  const lines = document.getElementById('barcode-lines');
  const code = wzRefNo.replace(/\D/g,'');
  lines.innerHTML = '';
  for (let i = 0; i < 60; i++) {
    const d = document.createElement('div');
    const w = (i % 3 === 0) ? 3 : (i % 5 === 0 ? 2 : 1);
    d.style.width = w + 'px';
    d.style.height = (i % 4 === 0 ? 48 : i % 2 === 0 ? 38 : 28) + 'px';
    lines.appendChild(d);
  }

  const wifiBox = document.getElementById('wifi-creds-box');
  if (wzWifi) {
    wifiBox.classList.remove('hidden');
    document.getElementById('wifi-user').textContent = 'hr_' + wzRefNo.slice(-6).toLowerCase();
    document.getElementById('wifi-pass').textContent = 'HR' + Math.random().toString(36).slice(2,8).toUpperCase();
  } else {
    wifiBox.classList.add('hidden');
  }

  const coinsTotal = (wzGuest?.coins || 0) - wzCoinsRedeemed + t.coinsEarned;
  document.getElementById('coins-earned-val').textContent = '+' + t.coinsEarned;
  document.getElementById('coins-total-val').textContent  = coinsTotal + ' coins';
  document.getElementById('coins-available-text').textContent = `Available: ${wzGuest?.coins||0} coins`;
}

function applyMembership(type) {
  wzMembership = type;
  buildSummary();
  if (type !== 'none') showToast(`${MEMBERSHIP_DISCOUNTS[type].label} applied`, 'success');
}

function applyPromo() {
  const code = document.getElementById('promo-input').value.trim().toUpperCase();
  if (!code) { showToast('Enter a promo code', 'warning'); return; }
  const promo = PROMOS[code];
  if (!promo) { showToast(`"${code}" is not a valid promo code`, 'error'); return; }
  wzPromo = promo;
  document.getElementById('promo-badge-wrap').innerHTML = `
    <div class="promo-badge">
      ✓ ${promo.label} — ${promo.desc}
      <span class="promo-x" onclick="removePromo()">✕</span>
    </div>`;
  buildSummary();
  showToast(`Promo "${promo.label}" applied — ${promo.desc}`, 'success');
}

function removePromo() {
  wzPromo = null;
  document.getElementById('promo-badge-wrap').innerHTML = '';
  document.getElementById('promo-input').value = '';
  buildSummary();
}

function redeemCoins() {
  if (!wzGuest) return;
  const available = wzGuest.coins - wzCoinsRedeemed;
  if (available <= 0) { showToast('No coins to redeem', 'warning'); return; }
  const redeem = Math.min(available, Math.floor(calcWizardTotals().grand));
  wzCoinsRedeemed += redeem;
  buildSummary();
  showToast(`${redeem} coins redeemed → -₱${redeem.toFixed(2)}`, 'success');
}

function confirmBooking() {
  const t = calcWizardTotals();
  const newBooking = {
    id: bookings.length + 1,
    num: wzRefNo,
    guestId: wzGuest?.id || 0,
    guest: wzGuest?.name || 'New Guest',
    school: wzGuest?.school || '—',
    plan: wzRate?.label || '—',
    date: new Date().toLocaleDateString('en-PH',{month:'2-digit',day:'2-digit',year:'numeric'}),
    start: new Date().toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'}),
    end: '—',
    checkout: null,
    status: 'active',
    base: wzRate?.price || 0,
    addons: t.addonAmt,
    extCost: 0,
    wifi: wzWifi ? 50 : 0,
    discount: t.totalDisc,
    discountLabel: wzMembership !== 'none' ? MEMBERSHIP_DISCOUNTS[wzMembership].label : wzPromo?.label || '',
    promos: [],
    extensions: [],
    addonList: wzAddons.filter(a=>a.qty>0).map(a=>a.name),
    coins: t.coinsEarned,
  };
  bookings.unshift(newBooking);
  showToast(`Booking ${wzRefNo} confirmed! ✓`, 'success');
  setTimeout(() => showPage('bookings'), 1200);
}

function printReceipt() {
  showToast('Opening print preview…', 'success');
  window.print();
}