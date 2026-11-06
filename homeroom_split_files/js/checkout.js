function onScanInput(val) {
  if (val.length > 10 && val.startsWith('BN-')) processCheckout();
}

function processCheckout() {
  const val = document.getElementById('checkout-input').value.trim().toUpperCase();
  if (!val) { showToast('Enter a booking number', 'warning'); return; }
  const b = bookings.find(x => x.num === val || x.num.endsWith(val));
  const result = document.getElementById('checkout-result');

  if (!b) {
    result.classList.remove('hidden');
    result.innerHTML = `<div class="card" style="border-color:var(--danger);text-align:center;padding:24px;">
      <div style="font-size:28px;margin-bottom:8px;">❌</div>
      <div style="font-weight:700;font-size:14px;margin-bottom:4px;">Booking not found</div>
      <div class="text-muted text-sm">No booking matches "${val}"</div>
    </div>`;
    return;
  }
  if (b.status === 'completed') {
    result.classList.remove('hidden');
    result.innerHTML = `<div class="card" style="border-color:var(--warning);text-align:center;padding:24px;">
      <div style="font-size:28px;margin-bottom:8px;">⚠️</div>
      <div style="font-weight:700;font-size:14px;">${b.guest} already checked out</div>
      <div class="text-muted text-sm">at ${b.checkout}</div>
    </div>`;
    return;
  }
  b.status = 'completed';
  b.checkout = new Date().toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'});
  result.classList.remove('hidden');
  result.innerHTML = `<div class="card" style="border-color:var(--success);text-align:center;padding:28px;">
    <div style="font-size:36px;margin-bottom:10px;">✅</div>
    <div style="font-weight:800;font-size:16px;margin-bottom:4px;">${b.guest} — Checked Out</div>
    <div class="text-muted text-sm">Booking ${b.num} · ${b.checkout}</div>
    <div style="margin-top:12px;" class="badge badge-gold" style="font-size:12px;">★ +${b.coins} coins earned</div>
  </div>`;
  document.getElementById('checkout-input').value = '';
  showToast(`${b.guest} checked out ✓`, 'success');
}