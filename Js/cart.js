// Cart management
class CartManager {
    constructor() {
        this.items = this.loadCart();
        this.listeners = [];
        this.updateCartDisplay();
    }

    // Load cart from localStorage
    loadCart() {
        try {
            const saved = localStorage.getItem('milan-crochet-cart');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }

    // Save cart to localStorage
    saveCart() {
        try {
            localStorage.setItem('milan-crochet-cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    // Add item to cart
    addItem(product, quantity = 1, size = null, color = null) {
        const existingItemIndex = this.items.findIndex(item => 
            item.product.id === product.id &&
            item.selectedSize === size &&
            item.selectedColor === color
        );

        if (existingItemIndex > -1) {
            this.items[existingItemIndex].quantity += quantity;
        } else {
            this.items.push({
                product,
                quantity,
                selectedSize: size,
                selectedColor: color
            });
        }

        this.saveCart();
        this.updateCartDisplay();
        this.notifyListeners();
        this.showAddToCartFeedback(product.name);
    }

    removeItem(productId) {
    // Convert to number if needed (IDs are often numbers)
    const id = Number(productId);
    
    console.log('Removing item with ID:', id);
    
    // Filter out the item
    this.items = this.items.filter(item => item.product.id !== id);
    
    this.saveCart();
    this.updateCartDisplay();
    this.notifyListeners();
}

    // Update item quantity
    updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            this.removeItem(productId);
            return;
        }

        const item = this.items.find(item => item.product.id === productId);
        if (item) {
            item.quantity = quantity;
            this.saveCart();
            this.updateCartDisplay();
            this.notifyListeners();
        }
    }

    // Clear cart
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
        this.notifyListeners();
    }

    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }

    // Get total item count
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    // Add change listener
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Notify listeners
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.items, this.getTotal()));
    }

    // Update cart display
    updateCartDisplay() {
        const cartCounts = document.querySelectorAll('.cart-count');
        const itemCount = this.getItemCount();
        
        cartCounts.forEach(count => {
            count.textContent = itemCount;
            count.style.display = itemCount > 0 ? 'flex' : 'none';
        });
    }

    // Show add to cart feedback
    showAddToCartFeedback(productName) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.innerHTML = `
            <div style="
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
            ">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    <span>Added "${productName}" to cart</span>
                </div>
            </div>
        `;

        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Render cart items
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');

        if (!cartItemsContainer) return;

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
            cartFooter.innerHTML = '';
            return;
        }

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <div class="cart-item-content">
                    <img src="${item.product.images[0]}" alt="${item.product.name}" class="cart-item-image">
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

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
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

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);