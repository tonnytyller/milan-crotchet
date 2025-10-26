console.log('🔄 Creating robust ProductsService...');

window.ProductsService = {
    getFeaturedProducts: async function() {
        console.log('🔄 Getting products from Supabase...');
        
        // Wait for Supabase to be ready
        if (!window.supabase || typeof window.supabase.from !== 'function') {
            console.log('⏳ Supabase not ready, waiting...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (!window.supabase || typeof window.supabase.from !== 'function') {
                console.log('❌ Supabase still not ready after wait');
                return [];
            }
        }
        
        try {
            console.log('📡 Querying Supabase...');
            const { data: products, error } = await window.supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .limit(8);
            
            if (error) {
                console.log('❌ Supabase error:', error);
                return [];
            }
            
            console.log('✅ Found products:', products?.length || 0);
            return products || [];
        } catch (err) {
            console.log('❌ Exception:', err);
            return [];
        }
    },

    getProductById: async function(productId) {
        console.log('🔄 Getting product from Supabase, ID:', productId);
        
        if (!window.supabase || typeof window.supabase.from !== 'function') {
            console.log('❌ Supabase not ready');
            return null;
        }
        
        try {
            const { data: product, error } = await window.supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .eq('is_active', true)
                .single();
            
            if (error) {
                console.log('❌ Supabase error fetching product:', error);
                console.log('🔍 Error details:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                return null;
            }
            
            console.log('✅ Found product:', product ? product.name : 'null');
            return product;
        } catch (err) {
            console.log('❌ Exception fetching product:', err);
            return null;
        }
    },

    // ADD THESE NEW METHODS FOR BETTER FUNCTIONALITY:

    // Get all products with optional filtering
    getAllProducts: async function(category = 'All', sortBy = 'featured') {
        console.log('🔄 Getting all products from Supabase...');
        
        if (!window.supabase || typeof window.supabase.from !== 'function') {
            console.log('❌ Supabase not ready');
            return [];
        }
        
        try {
            let query = window.supabase
                .from('products')
                .select('*')
                .eq('is_active', true);

            // Apply category filter if needed
            if (category && category !== 'All') {
                query = query.eq('category', category);
            }

            // Apply sorting
            switch (sortBy) {
                case 'price-low':
                    query = query.order('price', { ascending: true });
                    break;
                case 'price-high':
                    query = query.order('price', { ascending: false });
                    break;
                case 'name':
                    query = query.order('name', { ascending: true });
                    break;
                case 'newest':
                    query = query.order('created_at', { ascending: false });
                    break;
                case 'featured':
                default:
                    query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
                    break;
            }

            const { data: products, error } = await query;

            if (error) {
                console.log('❌ Supabase error:', error);
                return [];
            }
            
            console.log('✅ Found products:', products?.length || 0);
            return products || [];
        } catch (err) {
            console.log('❌ Exception:', err);
            return [];
        }
    },

    // Search products
    searchProducts: async function(searchTerm, category = 'All') {
        console.log('🔍 Searching products:', searchTerm);
        
        if (!window.supabase || typeof window.supabase.from !== 'function') {
            console.log('❌ Supabase not ready');
            return [];
        }
        
        try {
            let query = window.supabase
                .from('products')
                .select('*')
                .eq('is_active', true);

            if (searchTerm) {
                query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
            }

            if (category && category !== 'All') {
                query = query.eq('category', category);
            }

            const { data: products, error } = await query;

            if (error) {
                console.log('❌ Supabase error:', error);
                return [];
            }
            
            console.log('✅ Search results:', products?.length || 0);
            return products || [];
        } catch (err) {
            console.log('❌ Exception:', err);
            return [];
        }
    },

    // Get products by category
    getProductsByCategory: async function(category) {
        console.log('🔄 Getting products by category:', category);
        
        if (!window.supabase || typeof window.supabase.from !== 'function') {
            console.log('❌ Supabase not ready');
            return [];
        }
        
        try {
            const { data: products, error } = await window.supabase
                .from('products')
                .select('*')
                .eq('category', category)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.log('❌ Supabase error:', error);
                return [];
            }
            
            console.log('✅ Found products in category:', products?.length || 0);
            return products || [];
        } catch (err) {
            console.log('❌ Exception:', err);
            return [];
        }
    },

    // Test connection and get product count
    testConnection: async function() {
        console.log('🔍 Testing Supabase connection...');
        
        if (!window.supabase || typeof window.supabase.from !== 'function') {
            console.log('❌ No Supabase client found');
            return { success: false, error: 'No Supabase client' };
        }
        
        try {
            const { data: products, error, count } = await window.supabase
                .from('products')
                .select('*', { count: 'exact' });
                
            if (error) {
                console.log('❌ Supabase error:', error);
                return { success: false, error: error.message };
            }
            
            console.log('✅ Supabase connection successful');
            console.log('📊 Total products in database:', count);
            console.log('📦 Sample products:', products?.slice(0, 3));
            
            return { 
                success: true, 
                productCount: count,
                sampleProducts: products?.slice(0, 3) 
            };
        } catch (err) {
            console.log('❌ Exception:', err);
            return { success: false, error: err.message };
        }
    }
};

console.log('✅ Robust ProductsService created!');

// Auto-test connection when loaded
setTimeout(async () => {
    console.log('🔍 Auto-testing Supabase connection...');
    const result = await window.ProductsService.testConnection();
    console.log('🧪 Connection test result:', result);
}, 2000);