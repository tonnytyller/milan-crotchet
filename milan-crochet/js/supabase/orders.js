import { supabase } from './supabase-client.js';
import { TABLES } from '../utils/constants.js';
import { AppState } from '../utils/helpers.js';

class OrdersManager {
  async placeOrder({ paymentMethod, mpesaCode, depositCode, address }) {
    const user = AppState.user;
    if (!user) throw new Error('Login required');
    const { data: cartItems } = await supabase
      .from(TABLES.cartItems)
      .select('id, quantity, product_id, products(price)')
      .eq('user_id', user.id);
    const total = (cartItems || []).reduce((s, i) => s + i.quantity * (i.products?.price || 0), 0);
    const { data: order, error } = await supabase
      .from(TABLES.orders)
      .insert({ user_id: user.id, total, status: 'payment_pending', payment_method: paymentMethod, mpesa_code: mpesaCode || depositCode || null })
      .select()
      .single();
    if (error) throw error;

    const items = (cartItems || []).map(i => ({ order_id: order.id, product_id: i.product_id, quantity: i.quantity, price: i.products?.price || 0 }));
    const { error: itemsErr } = await supabase.from(TABLES.orderItems).insert(items);
    if (itemsErr) throw itemsErr;

    await supabase.from(TABLES.cartItems).delete().eq('user_id', user.id);
    return order;
  }
}

export const ordersManager = new OrdersManager();
