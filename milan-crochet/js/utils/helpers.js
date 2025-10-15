export const qs = (sel, el = document) => el.querySelector(sel);
export const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));
export const on = (el, evt, handler, opts) => el.addEventListener(evt, handler, opts);

export function triggerEvent(name, detail) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

export const AppState = {
  user: null,
  cart: [],
  stories: [],
  setUser(user) {
    this.user = user;
    triggerEvent('userLoggedIn', { user });
    updateHeader();
  },
  setCart(cart) {
    this.cart = cart || [];
    triggerEvent('cartUpdated', { cart: this.cart });
    updateHeader();
  }
};

function updateHeader() {
  const count = AppState.cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const el = qs('[data-cart-count]');
  if (el) el.textContent = String(count);
}

export function lazyLoadImages(root = document) {
  const images = qsa('img[data-src]', root);
  if (!('IntersectionObserver' in window)) {
    images.forEach(img => (img.src = img.dataset.src));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });
  images.forEach(img => observer.observe(img));
}
