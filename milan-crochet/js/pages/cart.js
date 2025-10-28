import { cartManager } from '../supabase/cart.js';
import { formatPrice } from '../utils/formatters.js';

function render(items) {
  const root = document.getElementById('cart-items');
  root.innerHTML = items.map(ci => `
    <div class="card" style="padding:12px; display:grid; grid-template-columns: 1fr auto; align-items:center; gap:12px">
      <div>
        <div style="font-weight:700">${ci.product?.name || ''}</div>
        <div>${formatPrice(ci.product?.price)}</div>
      </div>
      <div style="display:flex; gap:8px; align-items:center">
        <button class="btn btn-outline" data-dec="${ci.id}">-</button>
        <span>${ci.quantity}</span>
        <button class="btn btn-outline" data-inc="${ci.id}">+</button>
        <button class="btn btn-outline" data-del="${ci.id}">Remove</button>
      </div>
    </div>
  `).join('');

  root.addEventListener('click', async (e) => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    const del = e.target.closest('[data-del]');
    if (inc) { await cartManager.updateQuantity(inc.dataset.inc, (items.find(i => i.id === inc.dataset.inc).quantity + 1)); render(await cartManager.getCart()); }
    if (dec) { const item = items.find(i => i.id === dec.dataset.dec); await cartManager.updateQuantity(dec.dataset.dec, item.quantity - 1); render(await cartManager.getCart()); }
    if (del) { await cartManager.remove(del.dataset.del); render(await cartManager.getCart()); }
  }, { once: true });
}

async function load() {
  const items = await cartManager.getCart();
  render(items);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', load);
} else { load(); }
