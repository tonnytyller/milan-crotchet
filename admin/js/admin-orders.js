// Order Management Functions - Real Database Only
console.log('📋 Loading order management...');

// Order status management
class OrderManager {
    constructor() {
        this.orders = [];
        this.currentOrder = null;
        this.isInitialized = false;
    }

    // Initialize order manager
    async initialize() {
        if (this.isInitialized) {
            console.log('⚠️ Order manager already initialized');
            return;
        }

        console.log('🔄 Starting order manager initialization...');

        // Wait for all dependencies to be ready
        await this.waitForDependencies();

        // Setup event delegation for buttons
        this.setupEventDelegation();

        this.isInitialized = true;
        console.log('✅ Order manager initialized successfully');
        
        // Load orders
        await this.loadOrders();
    }

    // Wait for Supabase and database service to be ready
    async waitForDependencies() {
        let retries = 0;
        const maxRetries = 20;
        
        while (retries < maxRetries) {
            // Check if Supabase is loaded
            const supabaseReady = typeof window.supabase !== 'undefined';
            
            // Check if databaseService is loaded and has supabase instance
            const dbServiceReady = typeof databaseService !== 'undefined' && 
                                 databaseService.supabase !== null;
            
            if (supabaseReady && dbServiceReady) {
                console.log('✅ All dependencies ready');
                return true;
            }
            
            console.log('⏳ Waiting for dependencies...', {
                supabase: supabaseReady,
                dbService: dbServiceReady,
                retry: retries + 1
            });
            
            await new Promise(resolve => setTimeout(resolve, 300));
            retries++;
        }

        throw new Error('Dependencies not ready after waiting');
    }

    // Setup event delegation for buttons
    setupEventDelegation() {
        document.addEventListener('click', (event) => {
            const button = event.target.closest('[data-action]');
            if (!button) return;

            const action = button.getAttribute('data-action');
            const orderId = button.getAttribute('data-order');

            console.log(`🔄 Button clicked: ${action} for order ${orderId}`);

            switch (action) {
                case 'confirm':
                    this.confirmOrder(orderId);
                    break;
                case 'complete':
                    this.completeOrder(orderId);
                    break;
                case 'cancel':
                    this.cancelOrder(orderId);
                    break;
                case 'view':
                    this.viewOrderDetails(orderId);
                    break;
            }
        });
    }
    
    // Load orders data from real database
async loadOrders() {
    console.log('📦 Loading orders from database...');
    
    try {
        this.showLoading(true);
        
        // Use real database service
        const orders = await databaseService.getAllOrders();
        this.orders = orders;
        
        console.log(`✅ Loaded ${this.orders.length} orders from database`);
        
        // DEBUG: Log all orders and their statuses
        console.log('🔍 All orders with statuses:');
        this.orders.forEach(order => {
            console.log(`- ${order.id}: ${order.status} (${order.client_name || order.clientName})`);
        });
        
        // Render the orders
        this.renderOrderColumns();
        await this.updateStats();
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        this.showError('Failed to load orders from database. Please try again.');
        this.orders = [];
        this.renderOrderColumns();
    } finally {
        this.showLoading(false);
    }
}
    // Render order columns with status mapping
renderOrderColumns() {
    const columnsContainer = document.getElementById('orderColumns');
    if (!columnsContainer) {
        console.error('❌ orderColumns element not found');
        return;
    }

    if (this.orders.length === 0) {
        columnsContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-inbox"></i>
                <p>No orders found in database</p>
                <button class="btn btn-primary" onclick="refreshOrders()" style="margin-top: 1rem;">
                    <i class="fas fa-sync-alt"></i>
                    Refresh
                </button>
            </div>
        `;
        return;
    }

    // Map database statuses to display statuses
    const statusMapping = {
        'pending': 'pending',
        'confirmed': 'processing',  // Map confirmed to processing
        'delivered': 'completed',   // Map delivered to completed
        'cancelled': 'cancelled'
    };

    const columns = [
        { status: 'pending', title: 'Pending', class: 'column-pending' },
        { status: 'processing', title: 'Processing', class: 'column-processing' },
        { status: 'completed', title: 'Completed', class: 'column-completed' },
        { status: 'cancelled', title: 'Cancelled', class: 'column-cancelled' }
    ];

    columnsContainer.innerHTML = columns.map(column => 
        this.createOrderColumn(column, statusMapping)
    ).join('');
}

// Update createOrderColumn to use status mapping
createOrderColumn(column, statusMapping) {
    // Get the database statuses that map to this display status
    const matchingStatuses = Object.keys(statusMapping).filter(
        dbStatus => statusMapping[dbStatus] === column.status
    );
    
    const ordersInColumn = this.orders.filter(order => 
        matchingStatuses.includes(order.status)
    );
    
    return `
        <div class="order-column ${column.class}">
            <div class="column-header">
                <h3 class="column-title">${column.title}</h3>
                <span class="column-count">${ordersInColumn.length}</span>
            </div>
            <div class="order-cards" data-status="${column.status}">
                ${ordersInColumn.length > 0 
                    ? ordersInColumn.map(order => this.createOrderCard(order, statusMapping)).join('')
                    : this.createEmptyState(column.status)
                }
            </div>
        </div>
    `;
}

// Update createOrderCard to use mapped status for buttons
createOrderCard(order, statusMapping) {
    const itemsCount = order.items ? order.items.length : 0;
    const itemsText = itemsCount === 1 ? '1 item' : `${itemsCount} items`;
    const clientName = order.client_name || order.clientName || 'Unknown Client';
    const totalAmount = order.total_amount || order.totalAmount || 0;
    const notes = order.notes || order.special_instructions || '';
    
    // Map the database status to display status for buttons
    const displayStatus = statusMapping[order.status] || order.status;
    
    return `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <div class="order-number">${order.id}</div>
                <div class="order-client">${clientName}</div>
            </div>
            <div class="order-meta">
                <div class="order-items">${itemsText}</div>
                <div class="order-total">KSh ${totalAmount}</div>
            </div>
            ${notes ? `<div class="order-notes">${notes}</div>` : ''}
            <div class="order-actions">
                ${this.getActionButtons(displayStatus, order.id)}
            </div>
        </div>
    `;
}

    // Get action buttons based on order status
    getActionButtons(status, orderId) {
        switch (status) {
            case 'pending':
                return `
                    <button class="btn btn-primary" data-action="confirm" data-order="${orderId}">
                        Confirm Payment
                    </button>
                    <button class="btn btn-danger" data-action="cancel" data-order="${orderId}">
                        Cancel
                    </button>
                `;
            case 'processing':
                return `
                    <button class="btn btn-secondary" data-action="complete" data-order="${orderId}">
                        Complete Order
                    </button>
                    <button class="btn btn-danger" data-action="cancel" data-order="${orderId}">
                        Cancel
                    </button>
                `;
            case 'completed':
                return `
                    <button class="btn btn-outline" data-action="view" data-order="${orderId}">
                        View Details
                    </button>
                `;
            case 'cancelled':
                return `
                    <button class="btn btn-outline" data-action="view" data-order="${orderId}">
                        View Details
                    </button>
                `;
            default:
                return '';
        }
    }

    // Create empty state for column
    createEmptyState(status) {
        const messages = {
            pending: 'No pending orders',
            processing: 'No orders in progress',
            completed: 'No completed orders',
            cancelled: 'No cancelled orders'
        };

        return `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>${messages[status]}</p>
            </div>
        `;
    }

    // Update order status in real database
    // Update order status
async updateOrderStatus(orderId, newStatus) {
    try {
        console.log(`🔄 Updating order ${orderId} to ${newStatus}...`);
        
        // Map the display status to database status
        const statusMapping = {
            'pending': 'pending',
            'processing': 'confirmed',    // Map processing to confirmed
            'completed': 'delivered',     // Map completed to delivered
            'cancelled': 'cancelled'
        };
        
        const dbStatus = statusMapping[newStatus] || newStatus;
        console.log(`📝 Mapping ${newStatus} to database status: ${dbStatus}`);
        
        const updateData = { 
            status: dbStatus,
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

        console.log(`✅ Order ${orderId} updated to ${dbStatus}`);
        return data[0];
        
    } catch (error) {
        console.error('❌ Database update error:', error);
        throw error;
    }
}

    // Update statistics from real database with status mapping
async updateStats() {
    try {
        const stats = await databaseService.getOrderStats();
        
        console.log('📊 Stats received:', stats);
        
        // Map database statuses to expected statuses for calculation
        const statusMapping = {
            'pending': 'pending',
            'confirmed': 'processing',
            'delivered': 'completed', 
            'cancelled': 'cancelled'
        };
        
        // Update stat cards
        const revenueElement = document.getElementById('totalRevenue');
        const activeElement = document.getElementById('activeOrders');
        const completedElement = document.getElementById('completedOrders');
        const cancelledElement = document.getElementById('cancelledOrders');

        if (revenueElement) revenueElement.textContent = `KSh ${stats.totalRevenue || 0}`;
        
        // Active orders = pending + confirmed (which maps to processing)
        const activeOrders = (stats.pending || 0) + (stats.confirmed || 0);
        if (activeElement) activeElement.textContent = activeOrders;
        
        // Completed orders = delivered
        if (completedElement) completedElement.textContent = stats.delivered || 0;
        if (cancelledElement) cancelledElement.textContent = stats.cancelled || 0;
        
    } catch (error) {
        console.error('❌ Error fetching stats from database:', error);
        // Set all stats to 0 if error
        const elements = ['totalRevenue', 'activeOrders', 'completedOrders', 'cancelledOrders'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'totalRevenue') {
                    element.textContent = 'KSh 0';
                } else {
                    element.textContent = '0';
                }
            }
        });
    }
}

    // Confirm payment and move to processing
    confirmOrder(orderId) {
        if (confirm('Confirm that payment has been received for this order?')) {
            this.updateOrderStatus(orderId, 'processing');
        }
    }

    // Complete order
    completeOrder(orderId) {
        if (confirm('Mark this order as completed and delivered?')) {
            this.updateOrderStatus(orderId, 'completed');
        }
    }

    // Cancel order
    cancelOrder(orderId) {
        if (confirm('Are you sure you want to cancel this order?')) {
            this.updateOrderStatus(orderId, 'cancelled');
        }
    }

    // View order details
    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            this.showNotification('Order not found', 'error');
            return;
        }

        this.currentOrder = order;
        this.showOrderModal(order);
    }

    // Show order details modal
    showOrderModal(order) {
        const modal = document.getElementById('orderModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (!modal || !modalTitle || !modalBody) {
            console.error('Modal elements not found');
            return;
        }

        modalTitle.textContent = `Order Details - ${order.id}`;
        modalBody.innerHTML = this.createOrderDetailsHTML(order);

        modal.classList.add('show');

        // Close modal handlers
        const overlay = document.querySelector('.modal');
        const closeBtn = document.getElementById('modalClose');

        if (overlay) {
            overlay.onclick = (e) => {
                if (e.target === overlay) modal.classList.remove('show');
            };
        }
        if (closeBtn) {
            closeBtn.onclick = () => modal.classList.remove('show');
        }
    }

    // Create order details HTML
    createOrderDetailsHTML(order) {
        const clientName = order.client_name || order.clientName || 'Unknown';
        const clientEmail = order.client_email || order.clientEmail || 'Not provided';
        const clientPhone = order.client_phone || order.clientPhone || 'Not provided';
        const totalAmount = order.total_amount || order.totalAmount || 0;
        const orderDate = order.order_date || order.orderDate || 'Unknown';
        const paymentMethod = order.payment_method || order.paymentMethod || 'Unknown';
        const paymentConfirmed = order.payment_confirmed || order.paymentConfirmed || false;
        const notes = order.notes || order.special_instructions || 'None';
        
        const items = order.items || [];
        const itemsHTML = items.map(item => `
            <div class="order-item-detail">
                <strong>${item.name || 'Unknown Item'}</strong>
                <div>Quantity: ${item.quantity || 1}</div>
                <div>Price: KSh ${item.price || 0}</div>
                ${item.custom_notes ? `<div>Notes: ${item.custom_notes}</div>` : ''}
            </div>
        `).join('') || '<p>No items found</p>';

        return `
            <div class="order-details">
                <div class="detail-section">
                    <h4>Client Information</h4>
                    <p><strong>Name:</strong> ${clientName}</p>
                    <p><strong>Email:</strong> ${clientEmail}</p>
                    <p><strong>Phone:</strong> ${clientPhone}</p>
                </div>

                <div class="detail-section">
                    <h4>Order Items</h4>
                    ${itemsHTML}
                </div>

                <div class="detail-section">
                    <h4>Order Summary</h4>
                    <p><strong>Total Amount:</strong> KSh ${totalAmount}</p>
                    <p><strong>Status:</strong> <span class="status-${order.status}">${order.status}</span></p>
                    <p><strong>Order Date:</strong> ${orderDate}</p>
                    ${order.completed_date ? `<p><strong>Completed:</strong> ${order.completed_date}</p>` : ''}
                    ${order.cancelled_date ? `<p><strong>Cancelled:</strong> ${order.cancelled_date}</p>` : ''}
                </div>

                <div class="detail-section">
                    <h4>Payment & Notes</h4>
                    <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                    <p><strong>Payment Confirmed:</strong> ${paymentConfirmed ? 'Yes' : 'No'}</p>
                    <p><strong>Notes:</strong> ${notes}</p>
                </div>
            </div>
        `;
    }

    // Show loading overlay
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('active', show);
        }
    }

    // Show error message
    showError(message) {
        const columnsContainer = document.getElementById('orderColumns');
        if (columnsContainer) {
            columnsContainer.innerHTML = `
                <div class="error-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="refreshOrders()" style="margin-top: 1rem;">
                        <i class="fas fa-sync-alt"></i>
                        Try Again
                    </button>
                </div>
            `;
        }
        console.error('❌ Order Manager Error:', message);
    }

    // Show notification
    showNotification(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `notification notification-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Create global order manager instance
const orderManager = new OrderManager();

// Global functions for HTML onclick handlers
function refreshOrders() {
    if (window.orderManager) {
        window.orderManager.loadOrders();
    }
}

function filterOrders() {
    console.log('Search functionality coming soon...');
}

function navigateTo(page) {
    window.location.href = page;
}

function showComingSoon(feature) {
    alert(`🚧 ${feature} coming soon!`);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📄 Orders page loaded, initializing...');
    
    // Wait longer for all dependencies to load
    setTimeout(async () => {
        await orderManager.initialize();
    }, 500);
});

console.log('✅ Order management loaded successfully');