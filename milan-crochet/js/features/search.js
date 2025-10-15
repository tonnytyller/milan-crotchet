import { supabase } from '../supabase/supabase-client.js';

export async function searchProducts(query, limit = 10) {
  if (!query) return [];
  const { data, error } = await supabase
    .from('products')
    .select('id,name,price,thumbnail_url')
    .ilike('name', `%${query}%`)
    .limit(limit);
  if (error) throw error;
  return data || [];
}
