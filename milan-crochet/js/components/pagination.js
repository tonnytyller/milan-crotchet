export function renderPagination(container, { total, page, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  container.innerHTML = '';
  const mkBtn = (label, target, disabled = false) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline';
    btn.textContent = label;
    btn.disabled = disabled;
    btn.addEventListener('click', () => onChange(target));
    return btn;
  };
  container.appendChild(mkBtn('Prev', Math.max(1, page - 1), page <= 1));
  const pageInfo = document.createElement('span');
  pageInfo.style.padding = '0 8px';
  pageInfo.textContent = `${page} / ${totalPages}`;
  container.appendChild(pageInfo);
  container.appendChild(mkBtn('Next', Math.min(totalPages, page + 1), page >= totalPages));
}
