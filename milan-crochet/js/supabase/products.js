import { supabase } from './supabase-client.js';
import { TABLES } from '../utils/constants.js';

class ProductsManager {
  async list({ search, category, limit = 24, offset = 0 } = {}) {
    let query = supabase.from(TABLES.products).select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (search) query = query.ilike('name', `%${search}%`);
    if (category) query = query.eq('category', category);
    const { data, error, count } = await query;
    if (error) throw error;
    return { items: data, total: count || 0 };
  }

  async getById(id) {
    const { data, error } = await supabase.from(TABLES.products).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }
}

export const productsManager = new ProductsManager();
