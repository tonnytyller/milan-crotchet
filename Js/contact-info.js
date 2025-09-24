<!-- Create a new file: contact-info.js -->
<script>
// contact-info.js - Centralized contact information
const CONTACT_INFO = {
    phone: '+254791174063',
    formattedPhone: '+254 791 174063',
    email: 'hello@milancrochet.co.ke',
    instagram: 'milans_crotchet_wrld',
    whatsappLink: 'https://wa.me/254791174063',
    instagramLink: 'https://instagram.com/milans_crotchet_wrld'
};

// Function to update contact info in footer/headers
function updateContactInfo() {
    // Update phone numbers
    document.querySelectorAll('.phone-link').forEach(el => {
        el.href = `tel:${CONTACT_INFO.phone}`;
        el.textContent = CONTACT_INFO.formattedPhone;
    });
    
    // Update WhatsApp links
    document.querySelectorAll('.whatsapp-link').forEach(el => {
        el.href = CONTACT_INFO.whatsappLink;
    });
    
    // Update emails
    document.querySelectorAll('.email-link').forEach(el => {
        el.href = `mailto:${CONTACT_INFO.email}`;
        el.textContent = CONTACT_INFO.email;
    });
    
    // Update Instagram links
    document.querySelectorAll('.instagram-link').forEach(el => {
        el.href = CONTACT_INFO.instagramLink;
        el.textContent = `@${CONTACT_INFO.instagram}`;
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', updateContactInfo);
</script>

<!-- Updates to main.js -->
<script>
// main.js - Add to top of file (after DOMContentLoaded event)
// Make addToCartFromCard globally available
function addToCartFromCard(productId) {
    try {
        const product = getProductById(productId);
        if (product && typeof cart !== 'undefined') {
            const defaultSize = product.sizes.length > 0 ? product.sizes[0] : null;
            const defaultColor = product.colors.length > 0 ? product.colors[0] : null;
            cart.addItem(product, 1, defaultSize, defaultColor);
            
            // Show success feedback
            showToast('Added to cart!', 'success');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Error adding to cart', 'error');
    }
}

// Remove the duplicate definition from shop.js

// Add toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Add CSS for toast notifications
const toastStyles = document.createElement('style');
toastStyles.textContent = `
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    color: white;
    background: #059669;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 10000;
    max-width: 300px;
}

.toast.show {
    transform: translateX(0);
}

.toast.error {
    background: #dc2626;
}

.toast-content {
    display: flex;
    align-items: center;
    gap: 8px;
}
`;
document.head.appendChild(toastStyles);
</script>

<!-- Updates to product.js -->
<script>
// product.js - Update the rating section to use dynamic data
// Replace the hardcoded rating with this:
<div class="product-rating-section">
    <div class="rating-stars">
        ${generateStarRating(product.rating || 0)}
    </div>
    <span class="rating-info">(${product.rating || 0}) • ${product.reviewCount || 0} reviews</span>
</div>

// Add this helper function to data.js or main.js:
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon></svg>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2l3.09,6.26L22,9.27l-5,4.87l1.18,6.88L12,17.77l-6.18,3.25L7,14.14L2,9.27l6.91-1.01L12,2z M12,15.5V6.5"/></svg>';
        } else {
            stars += '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon></svg>';
        }
    }
    
    return stars;
}
</script>

<!-- Updates to shop.js -->
<script>
// shop.js - Remove the duplicate addToCartFromCard function
// Remove this entire function from shop.js:
/*
function addToCartFromCard(productId) {
    // ... remove this implementation
}
*/

// Update the rating display in product cards to use dynamic data
// Replace the hardcoded rating with:
<div class="product-rating">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
    </svg>
    <span>${product.rating || 0}</span>
</div>
</script>

<!-- Wishlist foundation (add to main.js) -->
<script>
// Wishlist functionality foundation
const Wishlist = {
    items: JSON.parse(localStorage.getItem('wishlist')) || [],
    
    init() {
        this.updateWishlistCount();
    },
    
    add(productId) {
        if (!this.items.includes(productId)) {
            this.items.push(productId);
            this.save();
            this.updateWishlistCount();
            showToast('Added to wishlist!');
        }
    },
    
    remove(productId) {
        const index = this.items.indexOf(productId);
        if (index > -1) {
            this.items.splice(index, 1);
            this.save();
            this.updateWishlistCount();
            showToast('Removed from wishlist');
        }
    },
    
    contains(productId) {
        return this.items.includes(productId);
    },
    
    save() {
        localStorage.setItem('wishlist', JSON.stringify(this.items));
    },
    
    updateWishlistCount() {
        const countElements = document.querySelectorAll('.wishlist-count');
        countElements.forEach(el => {
            el.textContent = this.items.length;
            el.style.display = this.items.length > 0 ? 'flex' : 'none';
        });
    }
};

// Initialize wishlist
document.addEventListener('DOMContentLoaded', () => Wishlist.init());

// Update toggleWishlist function
function toggleWishlist(productId) {
    if (Wishlist.contains(productId)) {
        Wishlist.remove(productId);
    } else {
        Wishlist.add(productId);
    }
    
    // Update UI state
    updateWishlistButtonState(productId);
}

function updateWishlistButtonState(productId) {
    const buttons = document.querySelectorAll(`[onclick*="toggleWishlist('${productId}')"]`);
    buttons.forEach(btn => {
        const svg = btn.querySelector('svg');
        if (svg) {
            if (Wishlist.contains(productId)) {
                svg.style.fill = 'currentColor';
                svg.style.stroke = 'none';
            } else {
                svg.style.fill = 'none';
                svg.style.stroke = 'currentColor';
            }
        }
    });
}
</script>