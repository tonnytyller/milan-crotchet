// Cart management - WORKING VERSION
console.log('🛒 Loading cart.js...');

class CartManager {
    constructor() {
        console.log('🛒 CartManager initialized');
        this.items = this.loadCart();
        this.listeners = [];
        this.updateCartDisplay();
    }

    // Load cart from localStorage
    loadCart() {
        try {
            const saved = localStorage.getItem('milan-crochet-cart');
            const items = saved ? JSON.parse(saved) : [];
            console.log('📦 Loaded cart items:', items.length);
            return items;
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }

    // Save cart to localStorage
    saveCart() {
        try {
            localStorage.setItem('milan-crochet-cart', JSON.stringify(this.items));
            console.log('💾 Saved cart items:', this.items.length);
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    // Add item to cart
    addItem(product, quantity = 1, size = null, color = null) {
        console.log('➕ Adding to cart:', product.name);
        
        const existingItemIndex = this.items.findIndex(item => 
            String(item.product.id) === String(product.id) &&
            item.selectedSize === size &&
            item.selectedColor === color
        );

        if (existingItemIndex > -1) {
            this.items[existingItemIndex].quantity += quantity;
            console.log('📈 Increased quantity to:', this.items[existingItemIndex].quantity);
        } else {
            this.items.push({
                product,
                quantity,
                selectedSize: size,
                selectedColor: color
            });
            console.log('🆕 Added new item to cart');
        }

        this.saveCart();
        this.updateCartDisplay();
        this.notifyListeners();
        this.showAddToCartFeedback(product.name);
    }

    removeItem(productId) {
    console.log('🗑️ Removing item with ID:', productId);
    const targetId = String(productId);
    
    const initialLength = this.items.length;
    this.items = this.items.filter(item => {
        const itemId = String(item.product.id);
        return itemId !== targetId;
    });
    
    console.log('📊 Removed items:', initialLength - this.items.length);
    
    this.saveCart();
    this.updateCartDisplay();
    this.notifyListeners();
    
    // ADD THIS LINE: Re-render the cart items
    this.renderCartItems(); // <-- ADD THIS
}

    // Update item quantity
    updateQuantity(productId, quantity) {
    console.log('🔢 Updating quantity for:', productId, 'to:', quantity);
    
    if (quantity <= 0) {
        this.removeItem(productId);
        return;
    }

    const item = this.items.find(item => String(item.product.id) === String(productId));
    if (item) {
        item.quantity = quantity;
        this.saveCart();
        this.updateCartDisplay();
        this.notifyListeners();
        
        // ADD THIS LINE: Re-render the cart items
        this.renderCartItems(); // <-- ADD THIS
    }
}

    // Clear cart
    clearCart() {
        console.log('🧹 Clearing cart');
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
        this.notifyListeners();
    }

    // Get cart total
    getTotal() {
        const total = this.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
        console.log('💰 Cart total:', total);
        return total;
    }

    // Get total item count
    getItemCount() {
        const count = this.items.reduce((count, item) => count + item.quantity, 0);
        return count;
    }

    // Add change listener
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Notify listeners
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.items, this.getTotal());
            } catch (e) {
                console.error('Error in cart listener:', e);
            }
        });
    }

    // Update cart display
    updateCartDisplay() {
        const cartCounts = document.querySelectorAll('.cart-count');
        const itemCount = this.getItemCount();
        
        console.log('🔄 Updating cart display, count:', itemCount);
        
        cartCounts.forEach(count => {
            count.textContent = itemCount;
            count.style.display = itemCount > 0 ? 'flex' : 'none';
        });
    }

    // Show add to cart feedback
    showAddToCartFeedback(productName) {
        console.log('🎉 Showing feedback for:', productName);
        
        const toast = document.createElement('div');
        toast.style.cssText = `
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
        `;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                <span>Added "${productName}" to cart</span>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    // Render cart items in sidebar
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');

        if (!cartItemsContainer) {
            console.log('❌ Cart items container not found');
            return;
        }

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"></path>
                        <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"></path>
                        <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"></path>
                    </svg>
                    <h3>Your cart is empty</h3>
                    <p>Add some beautiful crochet items to get started</p>
                    <button class="btn btn-primary" onclick="closeCart()">Continue Shopping</button>
                </div>
            `;
            if (cartFooter) cartFooter.innerHTML = '';
            return;
        }

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <div class="cart-item-content">
                    <img src="${item.product.images ? item.product.images[0] : (item.product.image_url || 'images/placeholder.jpg')}" alt="${item.product.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3 class="cart-item-name">${item.product.name}</h3>
                        <div class="cart-item-options">
                            ${item.selectedSize ? `<p>Size: ${item.selectedSize}</p>` : ''}
                            ${item.selectedColor ? `<p>Color: ${item.selectedColor}</p>` : ''}
                        </div>
                        <p class="cart-item-price">${formatPrice(item.product.price)}</p>
                    </div>
                    <div class="cart-item-actions">
                        <button class="cart-item-remove" onclick="cart.removeItem('${item.product.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                            </svg>
                        </button>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="cart.updateQuantity('${item.product.id}', ${item.quantity - 1})">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="cart.updateQuantity('${item.product.id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Render cart footer
        const subtotal = this.getTotal();
        const deliveryFee = subtotal > 5000 ? 0 : 200;
        const total = subtotal + deliveryFee;

        if (cartFooter) {
            cartFooter.innerHTML = `
                <div class="cart-summary">
                    <div class="cart-summary-row">
                        <span>Subtotal</span>
                        <span>${formatPrice(subtotal)}</span>
                    </div>
                    <div class="cart-summary-row">
                        <span>Delivery</span>
                        <span class="${deliveryFee === 0 ? 'text-green-600' : ''}">${deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
                    </div>
                    ${deliveryFee === 0 ? '<p class="delivery-note">Free delivery on orders over KSh 5,000</p>' : ''}
                    <div class="cart-summary-total">
                        <span>Total</span>
                        <span>${formatPrice(total)}</span>
                    </div>
                </div>
                <button class="btn btn-primary btn-full">Proceed to Checkout</button>
            `;
        }
    }
}

// Make sure formatPrice function exists
if (typeof formatPrice === 'undefined') {
    console.log('⚠️ formatPrice not found, defining fallback');
    window.formatPrice = function(price) {
        return `KSh ${price?.toLocaleString() || '0'}`;
    };
}

// Initialize cart
console.log('🛒 Creating cart instance...');
try {
    const cart = new CartManager();
    window.cart = cart;
    window.CartManager = CartManager;
    console.log('✅ Cart system ready!');
} catch (error) {
    console.error('❌ Failed to initialize cart:', error);
}

// Cart UI functions
function openCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar && window.cart) {
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

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Setting up cart event listeners');
    
    // Cart button click handlers
    const cartButtons = document.querySelectorAll('#cartBtn, .mobile-cart-btn');
    cartButtons.forEach(btn => {
        btn.addEventListener('click', openCart);
    });

    // Cart close handlers
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartClose) {
        cartClose.addEventListener('click', closeCart);
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }

    // Escape key to close cart
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCart();
        }
    });
});

console.log('🎉 cart.js loaded successfully!');