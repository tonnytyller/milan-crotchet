import { supabase } from './supabase-client.js'

export async function migrateProducts() {
    console.log('Starting product migration...');
    
    for (const product of mockProducts) {
        const { data, error } = await supabase
            .from('products')
            .insert({
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                images: product.images,
                tags: product.colors,
                stock_quantity: product.inStock ? 1 : 0, // Made-to-order
                is_active: true
            });

        if (error) {
            console.error('Error migrating:', product.name, error);
        } else {
            console.log('✓ Migrated:', product.name);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('Migration completed!');
}

// Run in browser console: migrateProducts()