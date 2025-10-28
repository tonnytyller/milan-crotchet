import { supabase } from './supabase-client.js';
import { TABLES } from '../utils/constants.js';
import { AppState } from '../utils/helpers.js';

class CartManager {
  async addToCart(productId, quantity = 1) {
    const user = AppState.user;
    if (!user) throw new Error('Login required');
    const { data: existing } = await supabase
      .from(TABLES.cartItems)
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from(TABLES.cartItems)
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select();
      if (error) throw error;
      return data?.[0];
    }

    const { data, error } = await supabase
      .from(TABLES.cartItems)
      .insert({ user_id: user.id, product_id: productId, quantity })
      .select();
    if (error) throw error;
    return data?.[0];
  }

  async getCart() {
    const user = AppState.user;
    if (!user) return [];
    const { data, error } = await supabase
      .from(TABLES.cartItems)
      .select('id, quantity, product:products(id, name, price, thumbnail_url)')
      .eq('user_id', user.id);
    if (error) throw error;
    AppState.setCart(data || []);
    return data || [];
  }

  async updateQuantity(cartItemId, quantity) {
    if (quantity <= 0) return this.remove(cartItemId);
    const { data, error } = await supabase
      .from(TABLES.cartItems)
      .update({ quantity })
      .eq('id', cartItemId)
      .select();
    if (error) throw error;
    await this.getCart();
    return data?.[0];
  }

  async remove(cartItemId) {
    const { error } = await supabase
      .from(TABLES.cartItems)
      .delete()
      .eq('id', cartItemId);
    if (error) throw error;
    await this.getCart();
  }
}

export const cartManager = new CartManager();
