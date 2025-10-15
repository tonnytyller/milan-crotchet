let toastContainer;

export function showToast(message, type = 'info', timeout = 3000) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  toastContainer.appendChild(el);
  const id = setTimeout(() => {
    el.remove();
  }, timeout);
  el.addEventListener('click', () => {
    clearTimeout(id);
    el.remove();
  });
}
