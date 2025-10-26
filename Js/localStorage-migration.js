// js/localStorage-migration.js
import { supabase } from './supabase.js';

class LocalStorageMigration {
    constructor() {
        this.migrationKey = 'milan_migration_completed';
    }
    
    // Check if migration is needed
    async shouldMigrate() {
        // Don't migrate if already completed
        if (localStorage.getItem(this.migrationKey)) {
            return false;
        }
        
        // Check if we have data to migrate
        const hasCart = localStorage.getItem('milan_cart');
        const hasWishlist = localStorage.getItem('milan_wishlist');
        const hasUser = localStorage.getItem('milan_user');
        
        return !!(hasCart || hasWishlist || hasUser);
    }
    
    // Get current user from localStorage or auth
    async getCurrentUser() {
        // First try to get from Supabase auth
        const { data: { user } } = await supabase.auth.getUser();
        if (user) return user;
        
        // Fallback to localStorage user data
        const localUser = JSON.parse(localStorage.getItem('milan_user') || '{}');
        if (localUser.id || localUser.email) {
            return localUser;
        }
        
        return null;
    }
    
    // Main migration function
    async migrateAllData() {
        console.log('🔄 Starting localStorage migration to Supabase...');
        
        const user = await this.getCurrentUser();
        if (!user) {
            console.log('No user found for migration');
            return false;
        }
        
        const userId = user.id;
        
        try {
            // Migrate cart data
            await this.migrateCart(userId);
            
            // Migrate wishlist data
            await this.migrateWishlist(userId);
            
            // Migrate user profile data
            await this.migrateUserProfile(userId);
            
            // Mark migration as completed
            localStorage.setItem(this.migrationKey, 'true');
            
            console.log('✅ localStorage migration completed successfully!');
            return true;
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
            return false;
        }
    }
    
    // Migrate shopping cart
    async migrateCart(userId) {
        const localCart = JSON.parse(localStorage.getItem('milan_cart') || '[]');
        
        if (localCart.length === 0) {
            console.log('No cart data to migrate');
            return;
        }
        
        console.log(`Migrating ${localCart.length} cart items...`);
        
        for (const item of localCart) {
            const cartItem = {
                user_id: userId,
                product_id: item.id || item.productId,
                quantity: item.quantity || 1,
                selected_size: item.size || item.selected_size,
                selected_color: item.color || item.selected_color
            };
            
            const { error } = await supabase
                .from('cart_items')
                .upsert(cartItem, { onConflict: 'user_id,product_id,selected_size,selected_color' });
            
            if (error) {
                console.error('Error migrating cart item:', error);
            }
        }
        
        console.log('✅ Cart migration completed');
    }
    
    // Migrate wishlist
    async migrateWishlist(userId) {
        const localWishlist = JSON.parse(localStorage.getItem('milan_wishlist') || '[]');
        
        if (localWishlist.length === 0) {
            console.log('No wishlist data to migrate');
            return;
        }
        
        console.log(`Migrating ${localWishlist.length} wishlist items...`);
        
        for (const item of localWishlist) {
            const wishlistItem = {
                user_id: userId,
                product_id: item.id || item.productId
            };
            
            const { error } = await supabase
                .from('wishlists')
                .upsert(wishlistItem, { onConflict: 'user_id,product_id' });
            
            if (error) {
                console.error('Error migrating wishlist item:', error);
            }
        }
        
        console.log('✅ Wishlist migration completed');
    }
    
    // Migrate user profile
    async migrateUserProfile(userId) {
        const localUser = JSON.parse(localStorage.getItem('milan_user') || '{}');
        
        if (!localUser.email && !localUser.phone) {
            console.log('No user profile data to migrate');
            return;
        }
        
        console.log('Migrating user profile...');
        
        const profileData = {
            id: userId,
            username: localUser.username,
            full_name: localUser.fullName || localUser.name,
            phone: localUser.phone,
            avatar_url: localUser.avatar,
            role: localUser.role || 'customer'
        };
        
        const { error } = await supabase
            .from('profiles')
            .upsert(profileData);
        
        if (error) {
            console.error('Error migrating user profile:', error);
        } else {
            console.log('✅ User profile migration completed');
        }
    }
    
    // Clean up localStorage after migration
    cleanLocalStorage() {
        console.log('🧹 Cleaning up localStorage...');
        
        // Remove sensitive data
        const sensitiveKeys = [
            'milan_cart',
            'milan_wishlist',
            'milan_user',
            'milan_orders',
            'milan_addresses',
            'milan_payment_methods'
        ];
        
        // Backup non-sensitive data
        const safeData = {
            theme: localStorage.getItem('milan_theme'),
            language: localStorage.getItem('milan_language'),
            recent_products: localStorage.getItem('milan_recent_products'),
            cart_filters: localStorage.getItem('milan_cart_filters')
        };
        
        // Clear all Milan data
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('milan_')) {
                localStorage.removeItem(key);
            }
        });
        
        // Restore safe data
        Object.entries(safeData).forEach(([key, value]) => {
            if (value) {
                localStorage.setItem(`milan_${key}`, value);
            }
        });
        
        console.log('✅ localStorage cleanup completed');
    }
    
    // Check migration status
    getMigrationStatus() {
        return {
            completed: localStorage.getItem(this.migrationKey) === 'true',
            hasCart: !!localStorage.getItem('milan_cart'),
            hasWishlist: !!localStorage.getItem('milan_wishlist'),
            hasUser: !!localStorage.getItem('milan_user')
        };
    }
}

// Create global instance
const localStorageMigration = new LocalStorageMigration();

export default localStorageMigration;