import { supabase } from '../supabase/supabase-client.js';

class StoriesManager {
  async uploadStory(file) {
    // Assumes authenticated user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    const path = `${userId}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from('stories').upload(path, file, { upsert: true });
    if (upErr) throw upErr;
    const { data: publicUrl } = supabase.storage.from('stories').getPublicUrl(path);
    const expires = new Date(Date.now() + 7*24*60*60*1000).toISOString();
    const { error } = await supabase.from('stories').insert({ user_id: userId, media_url: publicUrl.publicUrl, expires_at: expires });
    if (error) throw error;
  }

  async getActiveStories() {
    const { data, error } = await supabase.from('stories')
      .select('id, user_id, media_url, expires_at, users:profiles(full_name)')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  displayStories(rootId = 'stories') {
    const root = document.getElementById(rootId);
    if (!root) return;
    this.getActiveStories().then(stories => {
      root.innerHTML = stories.map(s => `
        <div class="story">
          <div class="progress"><span></span></div>
          <img src="${s.media_url}" alt="story" />
        </div>
      `).join('');
      requestAnimationFrame(() => {
        root.querySelectorAll('.progress span').forEach(bar => bar.style.width = '100%');
      });
    });
  }
}

export const storiesManager = new StoriesManager();
