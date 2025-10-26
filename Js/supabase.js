// js/supabase.js
const SUPABASE_URL = 'https://botiybwcqbybnrzpavsy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdGl5YndjcWJ5Ym5yenBhdnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDExNjMsImV4cCI6MjA3NjA3NzE2M30.lhZaya1iPIGfrcCQC369s_v0NcT7P1GtmQvzQteUyo8';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Test connection
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase.from('profiles').select('count');
        if (error) throw error;
        console.log('✅ Supabase connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection failed:', error);
        return false;
    }
}

// Initialize database tables
async function initializeDatabase() {
    console.log('🚀 Initializing database tables...');
    
    // Check if tables exist, if not create them
    const tables = [
        'profiles', 'products', 'cart_items', 'wishlists', 
        'orders', 'order_items', 'delivery_zones'
    ];
    
    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`Table ${table} doesn't exist yet - will be created on first insert`);
        }
    }
    
    // Insert delivery zones if they don't exist
    await initializeDeliveryZones();
}

// Initialize delivery zones
async function initializeDeliveryZones() {
    const { data: existingZones } = await supabase.from('delivery_zones').select('*');
    
    if (!existingZones || existingZones.length === 0) {
        const zones = [
            {
                zone_name: 'Ngong Town',
                areas: ['Ngong Town', 'Matasia', 'Ngong Hills'],
                cost: 0,
                delivery_time: 'Same day delivery',
                free_delivery_threshold: 0
            },
            {
                zone_name: 'Kajiado County',
                areas: ['Kiserian', 'Ongata Rongai', 'Bomas', 'Karen'],
                cost: 150,
                delivery_time: 'Next day delivery',
                free_delivery_threshold: 5000
            },
            {
                zone_name: 'Nairobi County',
                areas: ['Nairobi CBD', 'Westlands', 'Parklands', 'Upper Hill'],
                cost: 300,
                delivery_time: '2-day delivery',
                free_delivery_threshold: 5000
            }
        ];
        
        const { error } = await supabase.from('delivery_zones').insert(zones);
        if (error) {
            console.error('Error inserting delivery zones:', error);
        } else {
            console.log('✅ Delivery zones initialized');
        }
    }
}

export { supabase, testSupabaseConnection, initializeDatabase };