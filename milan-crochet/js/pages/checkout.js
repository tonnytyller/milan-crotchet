import { cartManager } from '../supabase/cart.js';
import { formatPrice } from '../utils/formatters.js';
import { KENYA_COUNTIES } from '../utils/constants.js';
import { ordersManager } from '../supabase/orders.js';

function populateCounties() {
  const select = document.querySelector('select[name="county"]');
  select.innerHTML = KENYA_COUNTIES.map(c => `<option value="${c}">${c}</option>`).join('');
}

async function renderSummary() {
  const items = await cartManager.getCart();
  const root = document.getElementById('order-summary');
  const total = items.reduce((s, i) => s + (i.quantity * (i.product?.price || 0)), 0);
  root.innerHTML = `
    <div class="card" style="padding:12px">
      ${items.map(i => `<div style="display:flex; justify-content:space-between"><span>${i.product?.name} × ${i.quantity}</span><strong>${formatPrice(i.product?.price * i.quantity)}</strong></div>`).join('')}
      <hr style="margin:8px 0" />
      <div style="display:flex; justify-content:space-between"><span>Total</span><strong>${formatPrice(total)}</strong></div>
    </div>`;
}

function getSelectedPayment() {
  const checked = document.querySelector('input[name="payment"]:checked');
  if (!checked) return { method: null };
  const method = checked.value;
  const code = method === 'mpesa_send' ? document.querySelector('.mpesa-code').value.trim()
    : method === 'cash_delivery' ? document.querySelector('.deposit-code').value.trim() : null;
  return { method, code };
}

function wire() {
  const container = document.getElementById('payment-methods');
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.whatsapp-btn');
    if (btn) {
      const url = `https://wa.me/2547XXXXXXX?text=${encodeURIComponent('Hello, I would like to pay for my order.')}`;
      window.open(url, '_blank');
    }
  });

  document.getElementById('place-order').addEventListener('click', async () => {
    const { method, code } = getSelectedPayment();
    if (!method) return alert('Select a payment method');
    const form = document.getElementById('address-form');
    const address = {
      full_name: form.full_name.value.trim(),
      phone: form.phone.value.trim(),
      county: form.county.value,
      postal_code: form.postal_code.value.trim(),
      address_line: form.address_line.value.trim(),
    };
    try {
      const order = await ordersManager.placeOrder({ paymentMethod: method, mpesaCode: code, depositCode: code, address });
      alert(`Order #${order.id} placed!`);
      location.href = '/milan-crochet/profile.html';
    } catch (e) { alert(e.message); }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { populateCounties(); renderSummary(); wire(); });
} else { populateCounties(); renderSummary(); wire(); }
