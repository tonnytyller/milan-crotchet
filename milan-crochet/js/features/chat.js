import { supabase } from '../supabase/supabase-client.js';

class ChatManager {
  constructor() {
    this.channel = supabase.channel('messages');
    this.channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      const event = new CustomEvent('chat:new_message', { detail: payload.new });
      document.dispatchEvent(event);
    }).subscribe();
  }

  async sendMessage(message, receiverId) {
    const { data: userData } = await supabase.auth.getUser();
    const senderId = userData?.user?.id;
    const { data, error } = await supabase.from('messages').insert({ sender_id: senderId, receiver_id: receiverId, body: message }).select();
    if (error) throw error;
    return data?.[0];
  }
}

export const chatManager = new ChatManager();
