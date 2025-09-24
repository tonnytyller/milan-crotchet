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
            
            wishlistItems.forEach(id => {
                const product = getProductById(id);
                if (product) {
                    content += `
                        <li class="wishlist-item">
                            <img src="${product.images[0]}" alt="${product.name}" onclick="navigateToProduct('${product.id}')">
                            <div class="wishlist-item-info">
                                <h4 class="wishlist-item-title" onclick="navigateToProduct('${product.id}')">${product.name}</h4>
                                <p class="wishlist-item-price">${formatPrice(product.price)}</p>
                            </div>
                            <button class="remove-wishlist-item" data-id="${id}">
                                Remove
                            </button>
                        </li>
                    `;
                }
            });
            
            content += `</ul>`;
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
            console.log('showToast started with:', message);
            
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
            console.log('Wishlist toast added to DOM');
            
            // Remove after 3 seconds with slideOut animation
            setTimeout(() => {
                toast.querySelector('div').style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                        console.log('Wishlist toast removed');
                    }
                }, 300);
            }, 3000);
            
        } catch (error) {
            console.error('Error in showToast:', error);
            // Fallback to console log if toast fails
            console.log('Wishlist:', message);
        }
    }
}; // Closing brace for the Wishlist object

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