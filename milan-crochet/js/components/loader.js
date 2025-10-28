export function showLoader(text = 'Loading...') {
  let el = document.getElementById('global-loader');
  if (!el) {
    el = document.createElement('div');
    el.id = 'global-loader';
    el.style.position = 'fixed';
    el.style.inset = '0';
    el.style.display = 'grid';
    el.style.placeItems = 'center';
    el.style.background = 'rgba(255,255,255,0.6)';
    el.style.backdropFilter = 'blur(2px)';
    el.style.zIndex = '200';
    document.body.appendChild(el);
  }
  el.textContent = text;
}

export function hideLoader() {
  const el = document.getElementById('global-loader');
  if (el) el.remove();
}
