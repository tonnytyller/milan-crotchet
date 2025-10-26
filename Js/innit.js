// js/init.js
import { supabase, testSupabaseConnection, initializeDatabase } from './supabase.js';
import authManager from './auth.js';
import localStorageMigration from './localStorage-migration.js';

class MilanApp {
    constructor() {
        this.isInitialized = false;
        this.supabaseConnected = false;
    }
    
    async init() {
        console.log('🚀 Initializing Milan Crotchet App...');
        
        try {
            // Test Supabase connection
            this.supabaseConnected = await testSupabaseConnection();
            
            if (!this.supabaseConnected) {
                console.warn('Supabase not connected - running in offline mode');
                this.setupOfflineMode();
                return;
            }
            
            // Initialize database tables
            await initializeDatabase();
            
            // Check migration status
            await this.checkMigrationStatus();
            
            // Initialize auth (will trigger migration if needed)
            await authManager.init();
            
            this.isInitialized = true;
            console.log('✅ Milan Crotchet App initialized successfully');
            
            // Dispatch initialized event
            window.dispatchEvent(new Event('milan-app-initialized'));
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.setupOfflineMode();
        }
    }
    
    async checkMigrationStatus() {
        const status = localStorageMigration.getMigrationStatus();
        console.log('📊 Migration Status:', status);
        
        if (status.completed) {
            console.log('✅ Data migration already completed');
        } else if (status.hasCart || status.hasWishlist || status.hasUser) {
            console.log('🔄 Data migration pending - will run when user signs in');
        } else {
            console.log('📝 No migration needed - fresh start');
        }
    }
    
    setupOfflineMode() {
        console.log('🔌 Setting up offline mode...');
        // Implement offline functionality here
        // Cart/wishlist will stay in localStorage
    }
    
    // Get app status
    getStatus() {
        return {
            initialized: this.isInitialized,
            supabaseConnected: this.supabaseConnected,
            user: authManager.currentUser,
            migration: localStorageMigration.getMigrationStatus()
        };
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const milanApp = new MilanApp();
    await milanApp.init();
    
    // Make app globally available
    window.milanApp = milanApp;
    
    // Show status in console
    console.log('🎯 Milan Crotchet Status:', milanApp.getStatus());
});

export default MilanApp;