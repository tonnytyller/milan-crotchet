// Database Service for Supabase Operations
console.log('🗄️ Loading database service...');

class DatabaseService {
    constructor() {
        this.supabase = supabase.createClient(
  'https://botiybwcqbybnrzpavsy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdGl5YndjcWJ5Ym5yenBhdnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDExNjMsImV4cCI6MjA3NjA3NzE2M30.lhZaya1iPIGfrcCQC369s_v0NcT7P1GtmQvzQteUyo8'
);
    }

    // Get all orders with their items
    async getAllOrders() {
        try {
            console.log('📦 Fetching orders from database...');
            
            const { data: orders, error } = await this.supabase
                .from('orders')
                .select('*')
                .order('order_date', { ascending: false });

            if (error) {
                console.error('❌ Error fetching orders:', error);
                throw error;
            }

            // Get order items for each order
            const ordersWithItems = await Promise.all(
                orders.map(async (order) => {
                    const { data: items, error: itemsError } = await this.supabase
                        .from('order_items')
                        .select('*')
                        .eq('order_id', order.id);

                    if (itemsError) {
                        console.error('❌ Error fetching order items:', itemsError);
                    }

                    return {
                        ...order,
                        items: items || []
                    };
                })
            );

            console.log(`✅ Fetched ${ordersWithItems.length} orders from database`);
            return ordersWithItems;
            
        } catch (error) {
            console.error('❌ Database error:', error);
            throw error;
        }
    }

    // Update order status
    async updateOrderStatus(orderId, newStatus) {
        try {
            console.log(`🔄 Updating order ${orderId} to ${newStatus}...`);
            
            const updateData = { 
                status: newStatus,
                updated_at: new Date().toISOString()
            };

            // Add completion or cancellation date
            if (newStatus === 'completed') {
                updateData.completed_date = new Date().toISOString().split('T')[0];
            } else if (newStatus === 'cancelled') {
                updateData.cancelled_date = new Date().toISOString().split('T')[0];
            }

            const { data, error } = await this.supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId)
                .select();

            if (error) {
                console.error('❌ Error updating order:', error);
                throw error;
            }

            console.log(`✅ Order ${orderId} updated to ${newStatus}`);
            return data[0];
            
        } catch (error) {
            console.error('❌ Database update error:', error);
            throw error;
        }
    }

    // Confirm payment for an order
    async confirmPayment(orderId) {
        try {
            console.log(`💰 Confirming payment for order ${orderId}...`);
            
            const { data, error } = await this.supabase
                .from('orders')
                .update({ 
                    payment_confirmed: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId)
                .select();

            if (error) {
                console.error('❌ Error confirming payment:', error);
                throw error;
            }

            console.log(`✅ Payment confirmed for order ${orderId}`);
            return data[0];
            
        } catch (error) {
            console.error('❌ Payment confirmation error:', error);
            throw error;
        }
    }

    // Get order statistics
    // Get order statistics
async getOrderStats() {
    try {
        console.log('📊 Fetching order statistics...');
        
        const { data: orders, error } = await this.supabase
            .from('orders')
            .select('status, total_amount');

        if (error) {
            console.error('❌ Error fetching stats:', error);
            throw error;
        }

        const stats = {
            pending: orders.filter(o => o.status === 'pending').length,
            processing: orders.filter(o => o.status === 'confirmed').length,   // ✅ FIXED
            completed: orders.filter(o => o.status === 'delivered').length,    // ✅ FIXED
            cancelled: orders.filter(o => o.status === 'cancelled').length,
            totalRevenue: orders
                .filter(o => o.status === 'delivered')                         // ✅ FIXED
                .reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0)
        };

        console.log('✅ Order statistics fetched:', stats);
        return stats;
        
    } catch (error) {
        console.error('❌ Stats calculation error:', error);
        throw error;
    }
}

    // Create a new order (for future use)
    async createOrder(orderData) {
        try {
            const { data, error } = await this.supabase
                .from('orders')
                .insert([orderData])
                .select();

            if (error) throw error;
            return data[0];
            
        } catch (error) {
            console.error('❌ Error creating order:', error);
            throw error;
        }
    }
    // Add these methods to your existing DatabaseService class

// Get all products
async getAllProducts() {
    try {
        console.log('🛍️ Fetching products from database...');
        
        const { data: products, error } = await this.supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching products:', error);
            throw error;
        }

        console.log(`✅ Fetched ${products.length} products from database`);
        return products;
        
    } catch (error) {
        console.error('❌ Database error:', error);
        throw error;
    }
}

// Create new product
async createProduct(productData) {
    try {
        console.log('🆕 Creating new product...');
        
        const { data, error } = await this.supabase
            .from('products')
            .insert([{
                ...productData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('❌ Error creating product:', error);
            throw error;
        }

        console.log('✅ Product created successfully:', data[0].id);
        return data[0];
        
    } catch (error) {
        console.error('❌ Product creation error:', error);
        throw error;
    }
}

// Update product
async updateProduct(productId, updates) {
    try {
        console.log(`✏️ Updating product ${productId}...`);
        
        const { data, error } = await this.supabase
            .from('products')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', productId)
            .select();

        if (error) {
            console.error('❌ Error updating product:', error);
            throw error;
        }

        console.log(`✅ Product ${productId} updated successfully`);
        return data[0];
        
    } catch (error) {
        console.error('❌ Product update error:', error);
        throw error;
    }
}

// Delete product
async deleteProduct(productId) {
    try {
        console.log(`🗑️ Deleting product ${productId}...`);
        
        const { error } = await this.supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) {
            console.error('❌ Error deleting product:', error);
            throw error;
        }

        console.log(`✅ Product ${productId} deleted successfully`);
        return true;
        
    } catch (error) {
        console.error('❌ Product deletion error:', error);
        throw error;
    }
}

// Upload product image to Supabase Storage
async uploadProductImage(file) {
    try {
        console.log('📤 Uploading product image...');
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { data, error } = await this.supabase.storage
            .from('products')
            .upload(filePath, file);

        if (error) {
            console.error('❌ Error uploading image:', error);
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = this.supabase.storage
            .from('products')
            .getPublicUrl(filePath);

        console.log('✅ Image uploaded successfully:', publicUrl);
        return publicUrl;
        
    } catch (error) {
        console.error('❌ Image upload error:', error);
        throw error;
    }
}


    // Add items to an order (for future use)
    async addOrderItems(orderId, items) {
        try {
            const itemsWithOrderId = items.map(item => ({
                ...item,
                order_id: orderId
            }));

            const { data, error } = await this.supabase
                .from('order_items')
                .insert(itemsWithOrderId)
                .select();

            if (error) throw error;
            return data;
            
        } catch (error) {
            console.error('❌ Error adding order items:', error);
            throw error;
        }
    }
}

// Create global instance
const databaseService = new DatabaseService();
console.log('✅ Database service loaded successfully');

async updateProductImage(productId, imageUrl) {
    try {
        console.log(`✏️ Updating product ${productId} with image URL...`);
        
        const { data, error } = await this.supabase
            .from('products')
            .update({
                image_url: imageUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', productId)
            .select();

        if (error) {
            console.error('❌ Error updating product image:', error);
            throw error;
        }

        console.log(`✅ Product ${productId} updated with image URL`);
        return data[0];
        
    } catch (error) {
        console.error('❌ Product image update error:', error);
        throw error;
    }
}
export default databaseService;