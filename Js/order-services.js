import { supabase } from './supabase-client.js'

export class OrdersService {
    static async getCustomerOrders(userId) {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items(*),
                shipping_addresses(*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        return { orders, error };
    }

    static async createOrder(orderData) {
        const { data: order, error } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();
        
        return { order, error };
    }
}