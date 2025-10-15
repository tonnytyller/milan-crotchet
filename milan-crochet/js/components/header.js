import { AppState, qs } from '../utils/helpers.js';

export function mountHeader() {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="container">
      <div class="brand">
        <div class="logo"></div>
        <a href="/milan-crochet/index.html" class="title">Milan Crochet</a>
      </div>
      <nav>
        <a href="/milan-crochet/shop.html">Shop</a>
        <a href="/milan-crochet/stories.html">Stories</a>
        <a href="/milan-crochet/messages.html">Messages</a>
        <a href="/milan-crochet/profile.html">Profile</a>
        <a href="/milan-crochet/cart.html" class="cart btn-icon">
          <span class="badge" data-cart-count>0</span>
          🧺
        </a>
      </nav>
    </div>
  `;
  document.body.prepend(header);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountHeader);
} else {
  mountHeader();
}
