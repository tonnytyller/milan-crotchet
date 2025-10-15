import { authManager } from '../supabase/auth.js';

async function loadProfile() {
  const user = await authManager.getUser();
  if (!user) return;
  const form = document.getElementById('profile-form');
  form.email.value = user.email || '';
}

function wire() {
  document.getElementById('logout').addEventListener('click', async () => {
    await authManager.logout();
    location.href = '/milan-crochet/index.html';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { loadProfile(); wire(); });
} else { loadProfile(); wire(); }
