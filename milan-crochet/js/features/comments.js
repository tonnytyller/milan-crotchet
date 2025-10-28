import { supabase } from '../supabase/supabase-client.js';

export async function listComments(productId) {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('id, user_id, comment, rating, created_at, profiles(full_name)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addComment(productId, comment, rating = 5) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  const { data, error } = await supabase
    .from('product_reviews')
    .insert({ product_id: productId, user_id: userId, comment, rating })
    .select();
  if (error) throw error;
  return data?.[0];
}
