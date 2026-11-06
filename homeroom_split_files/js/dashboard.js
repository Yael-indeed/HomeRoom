function renderMiniTable() {
  const t = document.getElementById('mini-table');
  if (!t) return;
  const slice = bookings.slice(0,6);
  t.innerHTML = `<thead><tr>
    <th style="padding:8px 12px;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-400);border-bottom:1px solid var(--border);white-space:nowrap;">Booking #</th>
    <th style="padding:8px 12px;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-400);border-bottom:1px solid var(--border);">Guest</th>
    <th style="padding:8px 12px;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-400);border-bottom:1px solid var(--border);">Total</th>
    <th style="padding:8px 12px;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-400);border-bottom:1px solid var(--border);">Status</th>
  </tr></thead><tbody>${slice.map(b=>`
    <tr style="border-bottom:1px solid var(--border);">
      <td style="padding:9px 12px;"><span class="cell-booking-no">${b.num}</span></td>
      <td style="padding:9px 12px;font-size:12px;font-weight:600;">${b.guest}</td>
      <td style="padding:9px 12px;" class="cell-cost">₱${calcTotal(b).toFixed(2)}</td>
      <td style="padding:9px 12px;"><span class="badge badge-${b.status}">${b.status}</span></td>
    </tr>`).join('')}</tbody>`;
}