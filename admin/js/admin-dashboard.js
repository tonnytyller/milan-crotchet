// Admin Dashboard Initialization
// Temporary database service fallback
window.databaseService = {
    async getAllOrders() {
        console.log('📦 Using fallback - no orders in database');
        return [];
    },
    async getOrderStats() {
        return {
            pending: 0,
            processing: 0, 
            completed: 0,
            cancelled: 0,
            totalRevenue: 0
        };
    }
};
console.log('🚀 Initializing admin dashboard...');

// Main dashboard controller
class DashboardController {
    constructor() {
        this.isInitialized = false;
    }

    // Initialize the dashboard
    initialize() {
        if (this.isInitialized) {
            console.log('⚠️ Dashboard already initialized');
            return;
        }

        console.log('🔄 Starting dashboard initialization...');

        // Check admin session first
        if (!initializeAdminSession()) {
            console.error('❌ Admin session check failed');
            return;
        }

        // Load and display orders
        this.loadOrders();
        
        // Set up event listeners
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('✅ Dashboard initialized successfully');
    }

    // Load orders data
    // Load orders data
async loadOrders() {
    console.log('📦 Loading orders data from database...');
    
    try {
        // Use real database data
        const orders = await databaseService.getAllOrders();
        
        // Initialize order manager with the real data
        orderManager.loadOrders(orders);
        
        console.log(`✅ Loaded ${orders.length} orders from database`);
    } catch (error) {
        console.error('❌ Error loading orders from database:', error);
        
        // Fallback: Show empty state
        orderManager.loadOrders([]);
        this.showError('Failed to load orders from database. The tables might be empty.');
    }
}

    // Set up event listeners
    setupEventListeners() {
        console.log('🔗 Setting up event listeners...');

        // Add Product button
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.showComingSoon('Add Product feature coming soon!');
            });
        }

        // View All Orders button
        const viewAllOrdersBtn = document.getElementById('viewAllOrdersBtn');
        if (viewAllOrdersBtn) {
            viewAllOrdersBtn.addEventListener('click', () => {
                this.showAllOrders();
            });
        }

        // View Clients button
        const viewClientsBtn = document.getElementById('viewClientsBtn');
        if (viewClientsBtn) {
            viewClientsBtn.addEventListener('click', () => {
                this.showComingSoon('Client management coming soon!');
            });
        }

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        console.log('✅ Event listeners setup complete');
    }

    // Show all orders in a comprehensive view
    showAllOrders() {
        const orders = getAllOrders();
        let ordersHTML = '';

        orders.forEach(order => {
            ordersHTML += `
                <div class="order-row">
                    <div class="order-id">${order.id}</div>
                    <div class="order-client">${order.clientName}</div>
                    <div class="order-amount">KSh ${order.totalAmount}</div>
                    <div class="order-status status-${order.status}">${order.status}</div>
                    <div class="order-date">${order.orderDate}</div>
                </div>
            `;
        });

        // Show in modal for now
        const modal = document.getElementById('orderModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = 'All Orders';
            modalBody.innerHTML = `
                <div class="all-orders-view">
                    <div class="orders-header">
                        <div class="header-id">Order ID</div>
                        <div class="header-client">Client</div>
                        <div class="header-amount">Amount</div>
                        <div class="header-status">Status</div>
                        <div class="header-date">Date</div>
                    </div>
                    <div class="orders-list">
                        ${ordersHTML}
                    </div>
                </div>
            `;
            modal.classList.add('show');
        }
    }

    // Show coming soon message
    showComingSoon(message) {
        orderManager.showNotification(message, 'info');
        
        // You can replace this with a proper modal later
        console.log('🚧 Coming soon:', message);
    }

    // Close all modals
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
    }

    // Refresh dashboard data
    refreshData() {
        console.log('🔄 Refreshing dashboard data...');
        this.loadOrders();
        orderManager.showNotification('Dashboard data refreshed');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Dashboard DOM loaded, initializing...');
    
    const dashboard = new DashboardController();
    dashboard.initialize();

    // Make dashboard globally available
    window.dashboard = dashboard;
});

// Add some CSS for the all orders view
const additionalStyles = `
    .all-orders-view {
        max-height: 400px;
        overflow-y: auto;
    }
    
    .orders-header {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        gap: 1rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 0.5rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }
    
    .order-row {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
        align-items: center;
    }
    
    .order-row:hover {
        background: #f9fafb;
    }
    
    .status-pending { color: #f59e0b; font-weight: 500; }
    .status-processing { color: #3b82f6; font-weight: 500; }
    .status-completed { color: #10b981; font-weight: 500; }
    .status-cancelled { color: #ef4444; font-weight: 500; }
    
    .order-item-detail {
        padding: 0.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.375rem;
        margin-bottom: 0.5rem;
        background: #f9fafb;
    }
    
    .detail-section {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .detail-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }
    
    .detail-section h4 {
        margin: 0 0 1rem 0;
        color: #374151;
        font-size: 1rem;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

console.log('✅ Dashboard controller ready');