import { productsManager } from '../supabase/products.js';
import { formatPrice } from '../utils/formatters.js';
import { lazyLoadImages, qs } from '../utils/helpers.js';
import { renderPagination } from '../components/pagination.js';

let page = 1;
const pageSize = 12;
let search = '';

async function load() {
  const grid = document.getElementById('product-grid');
  const { items, total } = await productsManager.list({ search, limit: pageSize, offset: (page - 1) * pageSize });
  grid.innerHTML = items.map(p => `
    <a class="product-card" href="/milan-crochet/product-detail.html?id=${p.id}">
      <div class="media"><img data-src="${p.thumbnail_url || ''}" alt="${p.name}"></div>
      <div class="content">
        <div class="title">${p.name}</div>
        <div class="price">${formatPrice(p.price)}</div>
      </div>
    </a>
  `).join('');
  lazyLoadImages(grid);
  renderPagination(document.getElementById('pagination'), {
    total, page, pageSize,
    onChange: (p) => { page = p; load(); }
  });
}

function wireSearch() {
  const input = qs('#search');
  if (!input) return;
  input.addEventListener('input', (e) => {
    search = e.target.value.trim();
    page = 1;
    load();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { wireSearch(); load(); });
} else {
  wireSearch(); load();
}
