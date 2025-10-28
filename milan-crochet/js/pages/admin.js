import { supabase } from '../supabase/supabase-client.js';

function mount(view) {
  const root = document.getElementById('admin-content');
  if (view === 'payments') return loadPendingPayments(root);
  if (view === 'products') return manageProducts(root);
  if (view === 'orders') return listOrders(root);
  return loadPendingPayments(root);
}

async function loadPendingPayments(root) {
  const { data } = await supabase.from('orders').select('id, status, total, mpesa_code').eq('status', 'payment_pending');
  root.innerHTML = `<h2>Pending Payments</h2>` + (data || []).map(o => `
    <div class="card" style="padding:12px; display:grid; grid-template-columns: 1fr auto; align-items:center; gap:12px">
      <div>Order #${o.id} - KES ${o.total}</div>
      <div><button class="btn btn-primary" data-verify="${o.id}">Verify</button></div>
    </div>
  `).join('');
  root.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-verify]');
    if (btn) {
      await supabase.from('orders').update({ status: 'confirmed' }).eq('id', btn.dataset.verify);
      mount('payments');
    }
  }, { once: true });
}

async function manageProducts(root) {
  const { data } = await supabase.from('products').select('id,name,price');
  root.innerHTML = `<h2>Products</h2>` + (data || []).map(p => `
    <div class="card" style="padding:12px; display:flex; justify-content:space-between; align-items:center">
      <div>${p.name}</div>
      <div>KES ${p.price}</div>
    </div>
  `).join('');
}

async function listOrders(root) {
  const { data } = await supabase.from('orders').select('id,status,total,created_at').order('created_at', { ascending: false });
  root.innerHTML = `<h2>Orders</h2>` + (data || []).map(o => `
    <div class="card" style="padding:12px; display:flex; justify-content:space-between; align-items:center">
      <div>#${o.id}</div>
      <div>${o.status}</div>
      <div>KES ${o.total}</div>
    </div>
  `).join('');
}

function wireNav() {
  document.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => mount(btn.dataset.view)));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { wireNav(); mount('payments'); });
} else { wireNav(); mount('payments'); }
