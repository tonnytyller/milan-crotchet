export function formatPrice(amount) {
  const value = Number(amount || 0);
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(value);
}

export function formatPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('0')) return `+254${digits.slice(1)}`;
  if (digits.startsWith('254')) return `+${digits}`;
  if (digits.startsWith('+')) return digits;
  return digits ? `+254${digits}` : '';
}

export function truncate(text, max = 64) {
  const value = String(text || '');
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
