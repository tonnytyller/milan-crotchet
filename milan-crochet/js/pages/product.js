import { productsManager } from '../supabase/products.js';
import { cartManager } from '../supabase/cart.js';
import { formatPrice } from '../utils/formatters.js';

function getId() {
  const params = new URLSearchParams(location.search);
  return params.get('id');
}

async function loadProduct() {
  const id = getId();
  if (!id) return;
  const p = await productsManager.getById(id);
  document.getElementById('product-name').textContent = p.name;
  document.getElementById('product-price').textContent = formatPrice(p.price);
  document.getElementById('product-desc').textContent = p.description || '';
  const img = document.getElementById('product-image');
  img.src = p.image_url || p.thumbnail_url || '';
}

function wireActions() {
  document.getElementById('add-to-cart').addEventListener('click', async () => {
    const id = getId();
    await cartManager.addToCart(id, 1);
    await cartManager.getCart();
    alert('Added to cart');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { loadProduct(); wireActions(); });
} else {
  loadProduct(); wireActions();
}
