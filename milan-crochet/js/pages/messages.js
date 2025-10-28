import { chatManager } from '../features/chat.js';
import { supabase } from '../supabase/supabase-client.js';

async function loadConversations() {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return;
  const { data } = await supabase.rpc('get_user_conversations', { uid: userId });
  const root = document.getElementById('conversations');
  root.innerHTML = (data || []).map(c => `<div><a href="#" data-user="${c.other_user_id}">${c.other_user_name || 'User'}</a></div>`).join('');

  root.addEventListener('click', (e) => {
    const link = e.target.closest('[data-user]');
    if (link) {
      root.querySelectorAll('a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      loadThread(link.dataset.user);
    }
  }, { once: true });
}

async function loadThread(otherUserId) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  const { data } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true });
  renderThread(data || [], userId, otherUserId);
}

function renderThread(messages, myId, otherId) {
  const thread = document.getElementById('thread');
  thread.innerHTML = messages.map(m => `<div class="msg ${m.sender_id === myId ? 'me' : ''}">${m.body}</div>`).join('');
  const input = document.getElementById('composer-input');
  const send = document.getElementById('send');
  send.onclick = async () => {
    if (!input.value.trim()) return;
    await chatManager.sendMessage(input.value.trim(), otherId);
    input.value = '';
  };

  const onNew = (e) => {
    const m = e.detail;
    if ((m.sender_id === otherId && m.receiver_id === myId) || (m.sender_id === myId && m.receiver_id === otherId)) {
      thread.insertAdjacentHTML('beforeend', `<div class="msg ${m.sender_id === myId ? 'me' : ''}">${m.body}</div>`);
      thread.scrollTop = thread.scrollHeight;
    }
  };
  document.addEventListener('chat:new_message', onNew);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadConversations); else loadConversations();
