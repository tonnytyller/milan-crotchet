import { supabase } from '../supabase/supabase-client.js';
import { formatPrice } from '../utils/formatters.js';
import { lazyLoadImages } from '../utils/helpers.js';

async function loadFeatured() {
  const container = document.getElementById('featured-products');
  if (!container) return;
  const { data, error } = await supabase
    .from('products')
    .select('id,name,price,thumbnail_url')
    .eq('is_featured', true)
    .limit(8);
  if (error) return;
  container.innerHTML = (data || []).map(p => `
    <a class="product-card" href="/milan-crochet/product-detail.html?id=${p.id}">
      <div class="media">
        <img data-src="${p.thumbnail_url || ''}" alt="${p.name}">
      </div>
      <div class="content">
        <div class="title">${p.name}</div>
        <div class="price">${formatPrice(p.price)}</div>
      </div>
    </a>
  `).join('');
  lazyLoadImages(container);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadFeatured);
} else {
  loadFeatured();
}
