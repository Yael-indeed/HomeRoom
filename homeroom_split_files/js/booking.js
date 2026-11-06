let bkPage = 1;
const BK_PER = 10;
let selectedBookingId = null;

function getFilteredBookings() {
  const s  = (document.getElementById('bk-search')?.value || '').toLowerCase();
  const st = document.getElementById('status-filter')?.value || '';
  const pl = document.getElementById('plan-filter')?.value || '';
  const df = document.getElementById('date-from')?.value || '';
  const dt = document.getElementById('date-to')?.value || '';
  return bookings.filter(b => {
    if (s  && !b.guest.toLowerCase().includes(s) && !b.num.toLowerCase().includes(s)) return false;
    if (st && b.status !== st) return false;
    if (pl && b.plan !== pl) return false;
    return true;
  });
}

function renderBookings() {
  const data  = getFilteredBookings();
  const total = data.length;
  const pages = Math.max(1, Math.ceil(total / BK_PER));
  if (bkPage > pages) bkPage = pages;
  const slice = data.slice((bkPage-1)*BK_PER, bkPage*BK_PER);

  const tbody = document.getElementById('bookings-tbody');
  if (!tbody) return;

  tbody.innerHTML = slice.map(b => `
    <tr class="${selectedBookingId === b.id ? 'row-selected' : ''}" onclick="openDrawer(${b.id})">
      <td><div class="cell-booking-no">${b.num}</div></td>
      <td><div class="cell-guest-name">${b.guest}</div><div class="cell-guest-sub">${b.school}</div></td>
      <td><span class="cell-plan">${b.plan}</span></td>
      <td class="cell-date">${b.date}</td>
      <td class="cell-date">${b.start}</td>
      <td class="cell-date">${b.end}</td>
      <td class="cell-cost">₱${calcTotal(b).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
      <td><span class="badge badge-gold" style="font-size:9px;">★${b.coins}</span></td>
      <td><span class="badge badge-${b.status}">${b.status}</span></td>
      <td>
        <div class="cell-actions">
          <button class="btn btn-ghost btn-sm btn-icon" title="View details" onclick="event.stopPropagation();openDrawer(${b.id})">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5"/><path d="M8 6v4M8 11v.5"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');

  document.getElementById('page-info').textContent =
    `Showing ${(bkPage-1)*BK_PER + 1}–${Math.min(bkPage*BK_PER, total)} of ${total} bookings`;

  const pb = document.getElementById('page-buttons');
  pb.innerHTML = '';
  const mkBtn = (label, p, disabled, isCur) => {
    const b = document.createElement('button');
    b.className = 'page-btn' + (isCur ? ' cur' : '');
    b.textContent = label;
    b.disabled = disabled;
    if (!disabled) b.onclick = () => { bkPage = p; renderBookings(); };
    pb.appendChild(b);
  };
  mkBtn('←', bkPage-1, bkPage===1, false);
  for (let i=1; i<=pages; i++) mkBtn(i, i, false, i===bkPage);
  mkBtn('→', bkPage+1, bkPage===pages, false);
}

function updateTodayBadge() {
  const today = bookings.filter(b => b.date === '05/02/2026').length;
  const el = document.getElementById('today-badge');
  if (el) el.textContent = `Today: ${today}`;
}

function clearFilters() {
  ['bk-search','date-from','date-to'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  ['status-filter','plan-filter'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  renderBookings();
}