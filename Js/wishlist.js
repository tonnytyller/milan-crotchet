// wishlist.js - Fixed and simplified
const Wishlist = {
    getItems: function() {
        try {
            const wishlistJSON = localStorage.getItem('milan-crochet-wishlist');
            return wishlistJSON ? JSON.parse(wishlistJSON) : [];
        } catch (error) {
            console.error('Error loading wishlist:', error);
            return [];
        }
    },
    
    addItem: function(productId) {
        const items = this.getItems();
        if (!items.includes(productId)) {
            items.push(productId);
            localStorage.setItem('milan-crochet-wishlist', JSON.stringify(items));
            this.updateWishlistCount();
            this.updateWishlistButtons();
            
            // Refresh modal if it's open
            if (document.getElementById('wishlistModal')) {
                this.showWishlist();
            }
            return true;
        }
        return false;
    },
    
    removeItem: function(productId) {
        let items = this.getItems();
        const index = items.indexOf(productId);
        if (index !== -1) {
            items.splice(index, 1);
            localStorage.setItem('milan-crochet-wishlist', JSON.stringify(items));
            this.updateWishlistCount();
            this.updateWishlistButtons();
            
            // Refresh modal if it's open
            if (document.getElementById('wishlistModal')) {
                this.showWishlist();
            }
            return true;
        }
        return false;
    },
    
    hasItem: function(productId) {
        const items = this.getItems();
        return items.includes(productId);
    },
    
    updateWishlistCount: function() {
        const count = this.getItems().length;
        
        const updateCountElement = (id) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = count;
                element.style.display = count > 0 ? 'flex' : 'none';
            }
        };
        
        updateCountElement('wishlistCount');
        updateCountElement('mobileWishlistCount');
    },
    
    updateWishlistButtons: function() {
        // This will be called after products are loaded
        setTimeout(() => {
            const buttons = document.querySelectorAll('.wishlist-btn');
            buttons.forEach(btn => {
                const productId = btn.getAttribute('data-id');
                if (productId && this.hasItem(productId)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }, 100);
    },
    
    init: function() {
        // Wait a bit for products to load before cleaning
        setTimeout(() => {
            this.cleanInvalidItems();
        }, 1000);
        this.updateWishlistCount();
        
        // Add event listeners
        const wishlistBtn = document.getElementById('wishlistBtn');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showWishlist();
            });
        }
        
        const mobileWishlistBtn = document.getElementById('mobileWishlistBtn');
        if (mobileWishlistBtn) {
            mobileWishlistBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showWishlist();
            });
        }
    },
    
    showWishlist: function() {
        // Remove existing modal if any
        const existingModal = document.getElementById('wishlistModal');
        const existingOverlay = document.getElementById('wishlistOverlay');
        if (existingModal) existingModal.remove();
        if (existingOverlay) existingOverlay.remove();
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'wishlistModal';
        modal.className = 'wishlist-modal';
        
        const wishlistItems = this.getItems();
        
        let content = `
            <div class="wishlist-header">
                <h3>Your Wishlist (${wishlistItems.length})</h3>
                <button id="closeWishlist" class="close-wishlist">&times;</button>
            </div>
            <div class="wishlist-content">
        `;
        
        if (wishlistItems.length === 0) {
            content += `
                <div class="empty-wishlist">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <h3>Your wishlist is empty</h3>
                    <p>Start adding products you love!</p>
                </div>
            `;
        } else {
            content += `<ul class="wishlist-items">`;
            
            let foundProducts = 0;
            wishlistItems.forEach(id => {
                const product = this.getProductById(id);
                if (product) {
                    foundProducts++;
                    content += `
                        <li class="wishlist-item">
                            <img src="${product.images && product.images[0] ? product.images[0] : '/placeholder.jpg'}" alt="${product.name}" onclick="navigateToProduct('${product.id}')">
                            <div class="wishlist-item-info">
                                <h4 class="wishlist-item-title" onclick="navigateToProduct('${product.id}')">${product.name}</h4>
                                <p class="wishlist-item-price">${this.formatPrice(product.price)}</p>
                            </div>
                            <button class="remove-wishlist-item" data-id="${id}">
                                Remove
                            </button>
                        </li>
                    `;
                }
            });
            
            // If no products were found, show empty state
            if (foundProducts === 0) {
                content = content.replace(`<ul class="wishlist-items">`, '');
                content += `
                    <div class="empty-wishlist">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <h3>Products not found</h3>
                        <p>Your wishlist contains products that are no longer available.</p>
                        <button onclick="Wishlist.clearWishlist()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #ec4899; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
                            Clear Wishlist
                        </button>
                    </div>
                `;
            } else {
                content += `</ul>`;
            }
        }
        
        content += `</div>`;
        modal.innerHTML = content;
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'wishlistOverlay';
        overlay.className = 'wishlist-overlay';
        
        // Add to DOM
        document.body.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Show with animation
        setTimeout(() => {
            modal.classList.add('open');
            overlay.classList.add('show');
        }, 10);
        
        // Add event listeners
        document.getElementById('closeWishlist').addEventListener('click', () => {
            this.hideWishlist();
        });
        
        overlay.addEventListener('click', () => {
            this.hideWishlist();
        });
        
        // Add remove item functionality
        const removeButtons = document.querySelectorAll('.remove-wishlist-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = button.getAttribute('data-id');
                this.removeItem(productId);
                // Modal will auto-refresh due to the removeItem method
            });
        });
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    },

    hideWishlist: function() {
        const modal = document.getElementById('wishlistModal');
        const overlay = document.getElementById('wishlistOverlay');
        
        if (modal) {
            modal.classList.remove('open');
            setTimeout(() => {
                if (modal.parentNode) modal.parentNode.removeChild(modal);
            }, 300);
        }
        
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, 300);
        }
        
        // Restore scrolling
        document.body.style.overflow = '';
    },
    
    toggleItem: function(productId) {
        if (this.hasItem(productId)) {
            this.removeItem(productId);
            this.showToast('Removed from wishlist');
            return 'removed';
        } else {
            if (this.addItem(productId)) {
                this.showToast('Added to wishlist');
                return 'added';
            }
        }
        return null;
    },

    showToast: function(message) {
        try {
            // Remove existing toast if any
            const existingToast = document.getElementById('wishlistToast');
            if (existingToast && existingToast.parentNode) {
                existingToast.parentNode.removeChild(existingToast);
            }
            
            // Determine icon based on message
            const iconSvg = message.includes('Added') ? 
                `<polyline points="20,6 9,17 4,12"></polyline>` : // Checkmark for added
                `<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>`; // X for removed
            
            // Create toast element similar to cart.js
            const toast = document.createElement('div');
            toast.id = 'wishlistToast';
            toast.className = 'wishlist-toast';
            toast.innerHTML = `
                <div style="
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #ec4899 0%, #f97316 100%);
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 0.5rem;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                    z-index: 1002;
                    animation: slideIn 0.3s ease;
                ">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${iconSvg}
                        </svg>
                        <span>${message}</span>
                    </div>
                </div>
            `;
            
            document.body.appendChild(toast);
            
            // Remove after 3 seconds with slideOut animation
            setTimeout(() => {
                if (toast.querySelector('div')) {
                    toast.querySelector('div').style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    }, 300);
                }
            }, 3000);
            
        } catch (error) {
            console.error('Error in showToast:', error);
        }
    },

    // FIXED METHODS
    
    getProductById: function(productId) {
        // Safety first - always return an array for products
        let products = [];
        
        // Method 1: Check if there's a global getProductById function
        if (typeof window.getProductById === 'function') {
            try {
                const product = window.getProductById(productId);
                if (product) return product;
            } catch (e) {
                console.log('Global getProductById failed, trying other methods...');
            }
        }
        
        // Method 2: Check ProductsService
        if (window.ProductsService) {
            // Try different property names in ProductsService
            const possibleProductProperties = ['products', 'allProducts', 'items', 'featuredProducts'];
            
            for (const prop of possibleProductProperties) {
                if (window.ProductsService[prop] && Array.isArray(window.ProductsService[prop])) {
                    products = window.ProductsService[prop];
                    console.log(`Found ${products.length} products in ProductsService.${prop}`);
                    break;
                }
            }
            
            // If no array found but ProductsService has a getProducts method
            if (products.length === 0 && typeof window.ProductsService.getProducts === 'function') {
                try {
                    const result = window.ProductsService.getProducts();
                    if (Array.isArray(result)) {
                        products = result;
                    }
                } catch (e) {
                    console.log('getProducts method failed:', e);
                }
            }
        }
        
        // Method 3: Check global arrays
        if (products.length === 0) {
            const globalArrays = ['products', 'allProducts', 'featuredProducts', 'productList'];
            for (const arrayName of globalArrays) {
                if (window[arrayName] && Array.isArray(window[arrayName])) {
                    products = window[arrayName];
                    console.log(`Found ${products.length} products in window.${arrayName}`);
                    break;
                }
            }
        }
        
        // Ensure products is always an array before using .find()
        if (!Array.isArray(products)) {
            console.warn('Products is not an array, converting to empty array');
            products = [];
        }
        
        // Try to find the product
        if (products.length > 0) {
            const product = products.find(p => {
                if (!p || !p.id) return false;
                // Handle different ID formats (string, number, UUID)
                return p.id == productId || 
                       p.id.toString() === productId.toString() ||
                       (p.product_id && p.product_id.toString() === productId.toString());
            });
            
            return product || null;
        }
        
        return null;
    },
    
    formatPrice: function(price) {
        if (typeof price !== 'number') {
            price = parseFloat(price) || 0;
        }
        return 'KSh ' + price.toLocaleString();
    },
    
    cleanInvalidItems: function() {
        try {
            const items = this.getItems();
            if (!items || items.length === 0) return 0;
            
            const validItems = [];
            let removedCount = 0;
            
            // Only clean if we can actually check products
            if (!window.ProductsService && !window.products) {
                console.log('Products not loaded yet, skipping cleanup');
                return 0;
            }
            
            items.forEach(id => {
                try {
                    const product = this.getProductById(id);
                    if (product && product.id) {
                        validItems.push(id);
                    } else {
                        removedCount++;
                        console.log('Removing invalid product ID:', id);
                    }
                } catch (error) {
                    console.error(`Error checking product ${id}:`, error);
                    // Keep the item if we can't verify it's invalid
                    validItems.push(id);
                }
            });
            
            if (removedCount > 0) {
                localStorage.setItem('milan-crochet-wishlist', JSON.stringify(validItems));
                this.updateWishlistCount();
                this.updateWishlistButtons();
                console.log(`Cleaned ${removedCount} invalid items from wishlist`);
            }
            
            return removedCount;
        } catch (error) {
            console.error('Error cleaning wishlist:', error);
            return 0;
        }
    },
    
    clearWishlist: function() {
        try {
            localStorage.removeItem('milan-crochet-wishlist');
            
            // Only try to update UI if elements exist
            setTimeout(() => {
                try {
                    this.updateWishlistCount();
                    this.updateWishlistButtons();
                    
                    // Refresh modal if it's open
                    const modal = document.getElementById('wishlistModal');
                    if (modal) {
                        this.showWishlist();
                    }
                } catch (uiError) {
                    console.log('UI update skipped');
                }
            }, 100);
            
            return true;
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            return false;
        }
    },
    
    // Debug method
    debugProductsService: function() {
        console.log('=== PRODUCTS SERVICE DEBUG ===');
        console.log('ProductsService exists:', !!window.ProductsService);
        if (window.ProductsService) {
            console.log('ProductsService keys:', Object.keys(window.ProductsService));
            console.log('ProductsService.products:', window.ProductsService.products);
            console.log('ProductsService.products type:', typeof window.ProductsService.products);
            console.log('ProductsService.products is array:', Array.isArray(window.ProductsService.products));
        }
        console.log('Global products:', window.products);
        console.log('Global getProductById:', typeof window.getProductById);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Wishlist.init();
});

// Make available globally
window.Wishlist = Wishlist;
window.toggleWishlist = function(productId, event) {
    if (event) event.stopPropagation();
    return Wishlist.toggleItem(productId);
};

// Fallback functions in case they're not defined elsewhere
if (typeof getProductById === 'undefined') {
    window.getProductById = function(productId) {
        return Wishlist.getProductById(productId);
    };
}

if (typeof formatPrice === 'undefined') {
    window.formatPrice = function(price) {
        return Wishlist.formatPrice(price);
    };
}

if (typeof navigateToProduct === 'undefined') {
    window.navigateToProduct = function(productId) {
        console.log('Would navigate to product:', productId);
        // window.location.href = `product.html?id=${productId}`;
    };
}