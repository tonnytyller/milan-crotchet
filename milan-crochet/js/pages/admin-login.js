import { authManager } from '../supabase/auth.js';

function wire() {
  const form = document.getElementById('admin-login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    try {
      await authManager.login(email, password, 'admin');
      location.href = '/milan-crochet/admin-dashboard.html';
    } catch (e) {
      alert(e.message);
    }
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();
