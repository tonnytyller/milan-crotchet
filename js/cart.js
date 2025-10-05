// Milan Crochet - Enhanced Cart System
class CartManager {
    constructor() {
        this.cartKey = 'milan-crochet-cart-v2'; // New key to avoid conflicts
        this.items = this.loadCart();
        this.init();
    }

    // Initialize cart system
    init() {
        this.updateCartDisplay();
        this.setupGlobalEventListeners();
        console.log('Cart system initialized with', this.items.length, 'items');
    }

    // Load cart from localStorage with error handling
    loadCart() {
        try {
            const saved = localStorage.getItem(this.cartKey);
            if (!saved) return [];
            
            const items = JSON.parse(saved);
            // Validate cart structure
            return items.filter(item => 
                item && 
                item.product && 
                item.product.id && 
                item.quantity > 0
            );
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }

    // Save cart to localStorage with error handling
    saveCart() {
        try {
            localStorage.setItem(this.cartKey, JSON.stringify(this.items));
            return true;
        } catch (error) {
            console.error('Error saving cart:', error);
            return false;
        }
    }

    // Add item to cart - COMPLETELY REWRITTEN
    addItem(product, quantity = 1, size = null, color = null) {
        // Validate input
        if (!product || !product.id) {
            console.error('Invalid product');
            return false;
        }

        const existingIndex = this.findCartItemIndex(product.id, size, color);
        
        if (existingIndex > -1) {
            // Update existing item
            this.items[existingIndex].quantity += quantity;
        } else {
            // Add new item
            this.items.push({
                product: this.sanitizeProduct(product),
                quantity: quantity,
                selectedSize: size,
                selectedColor: color,
                addedAt: new Date().toISOString()
            });
        }

        // Save and update
        if (this.saveCart()) {
            this.updateCartDisplay();
            this.showAddToCartFeedback(product.name);
            this.refreshCartUI();
            return true;
        }
        return false;
    }

    // Remove item from cart - COMPLETELY REWRITTEN
    removeItem(productId, size = null, color = null) {
        const initialLength = this.items.length;
        
        this.items = this.items.filter(item => 
            !(item.product.id === productId && 
              item.selectedSize === size && 
              item.selectedColor === color)
        );

        if (this.items.length !== initialLength) {
            this.saveCart();
            this.updateCartDisplay();
            this.refreshCartUI();
            this.showRemoveFeedback();
            return true;
        }
        return false;
    }

    // Update quantity - COMPLETELY REWRITTEN
    updateQuantity(productId, newQuantity, size = null, color = null) {
        if (newQuantity <= 0) {
            return this.removeItem(productId, size, color);
        }

        const item = this.findCartItem(productId, size, color);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartDisplay();
            this.refreshCartUI();
            return true;
        }
        return false;
    }

    // Helper methods
    findCartItemIndex(productId, size = null, color = null) {
        return this.items.findIndex(item => 
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
        );
    }

    findCartItem(productId, size = null, color = null) {
        return this.items.find(item => 
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
        );
    }

    sanitizeProduct(product) {
        // Return only necessary product data
        return {
            id: product.id,
            name: product.name,
            price: product.price,
            images: product.images || [],
            category: product.category
        };
    }

    // Cart calculations
    getTotal() {
        return this.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
        this.refreshCartUI();
    }

    // UI Updates - COMPLETELY REWRITTEN
    updateCartDisplay() {
        const itemCount = this.getItemCount();
        
        // Update all cart count elements
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = itemCount;
            element.style.display = itemCount > 0 ? 'flex' : 'none';
        });
    }

    refreshCartUI() {
        // If cart sidebar is open, re-render it
        if (this.isCartOpen()) {
            this.renderCartItems();
        }
    }

    isCartOpen() {
        const cartSidebar = document.getElementById('cartSidebar');
        return cartSidebar && cartSidebar.classList.contains('open');
    }

    // Render cart items in sidebar
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');

        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = this.getEmptyCartHTML();
            if (cartFooter) cartFooter.innerHTML = '';
            return;
        }

        // Render cart items
        cartItemsContainer.innerHTML = this.items.map(item => this.getCartItemHTML(item)).join('');
        
        // Render cart footer
        if (cartFooter) {
            cartFooter.innerHTML = this.getCartFooterHTML();
        }
    }

    getEmptyCartHTML() {
        return `
            <div class="cart-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"></path>
                    <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"></path>
                    <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"></path>
                </svg>
                <h3>Your cart is empty</h3>
                <p>Add some beautiful crochet items to get started</p>
                <button class="btn btn-primary" onclick="closeCart(); navigateTo('shop.html')">
                    Start Shopping
                </button>
            </div>
        `;
    }

    getCartItemHTML(item) {
        return `
            <div class="cart-item" data-id="${item.product.id}" data-size="${item.selectedSize}" data-color="${item.selectedColor}">
                <div class="cart-item-content">
                    <img src="${item.product.images[0]}" alt="${item.product.name}" class="cart-item-image"
                         onclick="navigateToProduct('${item.product.id}')">
                    <div class="cart-item-details">
                        <h3 class="cart-item-name" onclick="navigateToProduct('${item.product.id}')">
                            ${item.product.name}
                        </h3>
                        <div class="cart-item-options">
                            ${item.selectedSize ? `<span class="option-tag">Size: ${item.selectedSize}</span>` : ''}
                            ${item.selectedColor ? `<span class="option-tag">Color: ${item.selectedColor}</span>` : ''}
                        </div>
                        <p class="cart-item-price">${formatPrice(item.product.price)}</p>
                    </div>
                    <div class="cart-item-actions">
                        <button class="cart-item-remove" 
                                onclick="cart.removeItem('${item.product.id}', '${item.selectedSize}', '${item.selectedColor}')"
                                title="Remove item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <div class="quantity-controls">
                            <button class="quantity-btn" 
                                    onclick="cart.updateQuantity('${item.product.id}', ${item.quantity - 1}, '${item.selectedSize}', '${item.selectedColor}')"
                                    ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" 
                                    onclick="cart.updateQuantity('${item.product.id}', ${item.quantity + 1}, '${item.selectedSize}', '${item.selectedColor}')">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getCartFooterHTML() {
        const subtotal = this.getTotal();
        const deliveryFee = subtotal > 5000 ? 0 : 200;
        const total = subtotal + deliveryFee;

        return `
            <div class="cart-summary">
                <div class="cart-summary-row">
                    <span>Subtotal (${this.getItemCount()} items)</span>
                    <span>${formatPrice(subtotal)}</span>
                </div>
                <div class="cart-summary-row">
                    <span>Delivery</span>
                    <span class="${deliveryFee === 0 ? 'text-green-600' : ''}">
                        ${deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}
                    </span>
                </div>
                ${deliveryFee === 0 ? 
                    '<div class="delivery-note">Free delivery on orders over KSh 5,000</div>' : 
                    ''
                }
                <div class="cart-summary-total">
                    <span>Total</span>
                    <span>${formatPrice(total)}</span>
                </div>
            </div>
            <div class="cart-actions">
                <button class="btn btn-secondary btn-full" onclick="closeCart()">
                    Continue Shopping
                </button>
                <button class="btn btn-primary btn-full" onclick="proceedToCheckout()">
                    Proceed to Checkout
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12,5 19,12 12,19"></polyline>
                    </svg>
                </button>
            </div>
        `;
    }

    // Feedback system
    showAddToCartFeedback(productName) {
        this.showToast(`Added "${productName}" to cart`, 'success');
    }

    showRemoveFeedback() {
        this.showToast('Item removed from cart', 'info');
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.cart-toast').forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `cart-toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                </div>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    }

    // Event listeners
    setupGlobalEventListeners() {
        // Listen for storage events (cross-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key === this.cartKey) {
                this.items = this.loadCart();
                this.updateCartDisplay();
                this.refreshCartUI();
            }
        });

        // Update cart when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.items = this.loadCart();
                this.updateCartDisplay();
            }
        });
    }
}

// Enhanced CSS for new cart
const cartStyles = `
    .cart-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    }

    .cart-toast.success {
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    }

    .cart-toast.info {
        background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
    }

    .toast-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .toast-icon {
        display: flex;
        align-items: center;
    }

    .cart-item-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin: 0.5rem 0;
    }

    .option-tag {
        background: #f3f4f6;
        color: #374151;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .cart-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 1rem;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .text-green-600 {
        color: #059669;
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = cartStyles;
document.head.appendChild(styleSheet);

// Initialize cart
const cart = new CartManager();

// Cart UI functions
function openCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.add('open');
        cart.renderCartItems();
        document.body.style.overflow = 'hidden';
    }
}

function closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function proceedToCheckout() {
    if (cart.items.length === 0) {
        cart.showToast('Your cart is empty', 'info');
        return;
    }
    
    closeCart();
    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 400);
}

// Global event listeners for cart
document.addEventListener('DOMContentLoaded', function() {
    // Cart button click handlers
    const cartButtons = document.querySelectorAll('#cartBtn, .mobile-cart-btn');
    cartButtons.forEach(btn => {
        btn.addEventListener('click', openCart);
    });

    // Cart close handlers
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Escape key to close cart
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeCart();
    });

    // Update cart display on page load
    cart.updateCartDisplay();
});

// Add to cart from product card (update your main.js)
function addToCartFromCard(productId) {
    const product = getProductById(productId);
    if (product) {
        const defaultSize = product.sizes.length > 0 ? product.sizes[0] : null;
        const defaultColor = product.colors.length > 0 ? product.colors[0] : null;
        cart.addItem(product, 1, defaultSize, defaultColor);
    }
}