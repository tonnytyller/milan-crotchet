import { supabase, getCurrentUser } from './supabase-client.js';
import { triggerEvent, AppState } from '../utils/helpers.js';

class AuthManager {
  async login(email, password, role) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const user = data.user;
    if (role) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;
      if (profile?.role !== role) {
        await supabase.auth.signOut();
        throw new Error('Unauthorized role');
      }
    }
    AppState.setUser(user);
    triggerEvent('userLoggedIn', { user });
    return user;
  }

  async signUp({ email, password, full_name, phone }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, phone } }
    });
    if (error) throw error;
    const user = data.user;
    await supabase.from('profiles').insert({ id: user.id, email, full_name, phone, role: 'customer' });
    return user;
  }

  async logout() {
    await supabase.auth.signOut();
    AppState.setUser(null);
    triggerEvent('userLoggedOut', {});
  }

  async getUser() {
    return await getCurrentUser();
  }
}

export const authManager = new AuthManager();
