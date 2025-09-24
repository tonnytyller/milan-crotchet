// Main JavaScript file for homepage and common functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Load featured products on homepage
    if (document.getElementById('featuredProducts')) {
        loadFeaturedProducts();
    }
    
    // Initialize newsletter form
    initializeNewsletterForm();
});

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            const isOpen = mobileMenu.style.display === 'block';
            mobileMenu.style.display = isOpen ? 'none' : 'block';
            
            // Update button icon
            const icon = mobileMenuBtn.querySelector('svg');
            if (isOpen) {
                // Show hamburger icon
                icon.innerHTML = `
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                `;
            } else {
                // Show close icon
                icon.innerHTML = `
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                `;
            }
        });
        
        // Close mobile menu when clicking on links
        const mobileNavLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.style.display = 'none';
                const icon = mobileMenuBtn.querySelector('svg');
                icon.innerHTML = `
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                `;
            });
        });
    }
}

// Load featured products
function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    const featuredProducts = getFeaturedProducts();
    
    container.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');
    
    
    Wishlist.updateWishlistButtons();
}

function createProductCard(product) {
    // REMOVE THIS LINE: const isInWishlist = Wishlist.hasItem(product.id);
    // REMOVE THIS LINE: const wishlistClass = isInWishlist ? 'active' : '';
    
    const colors = product.colors.slice(0, 3).map(color => `
        <div class="color-dot" style="background-color: ${getColorStyle(color)}" title="${color}"></div>
    `).join('');
    
    const moreColors = product.colors.length > 3 ? `
        <span class="color-more">+${product.colors.length - 3} more</span>
    ` : '';
    
    return `
        <div class="product-card" onclick="navigateToProduct('${product.id}')">
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}">
                ${product.featured ? '<div class="product-badge">Featured</div>' : ''}
                <button class="wishlist-btn" data-id="${product.id}" onclick="event.stopPropagation(); toggleWishlist('${product.id}', event)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
            </div>
            <div class="product-content">
                <div class="product-header">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-rating">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                        </svg>
                        <span>4.8</span>
                    </div>
                </div>
                <p class="product-description">${product.description}</p>
                <div class="product-price-category">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    <span class="product-category">${product.category}</span>
                </div>
                <div class="product-colors">
                    ${colors}
                    ${moreColors}
                </div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCartFromCard('${product.id}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"></path>
                        <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"></path>
                        <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"></path>
                    </svg>
                    Add to Cart
                </button>
            </div>
        </div>
    `;
}

// Navigation functions
function navigateTo(url) {
    window.location.href = url;
}

function navigateToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Add to cart from product card
function addToCartFromCard(productId) {
    const product = getProductById(productId);
    if (product) {
        const defaultSize = product.sizes.length > 0 ? product.sizes[0] : null;
        const defaultColor = product.colors.length > 0 ? product.colors[0] : null;
        cart.addItem(product, 1, defaultSize, defaultColor);
    }
}

// Newsletter form
function initializeNewsletterForm() {
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            
            // Simulate newsletter subscription
            console.log('Newsletter subscription:', email);
            
            // Show success message
            const button = this.querySelector('button');
            const originalText = button.textContent;
            button.textContent = 'Subscribed!';
            button.style.background = '#059669';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                this.reset();
            }, 2000);
        });
    }
}

// Smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}
// Add comment data structure to data.js
const productComments = {
    '1': [
        { user: "Sarah M.", comment: "Absolutely love this top! Perfect for summer.", date: "2024-01-15", rating: 5 },
        { user: "Jessica K.", comment: "Great quality and fits perfectly!", date: "2024-01-10", rating: 4 }
    ],
    '2': [
        { user: "Emma L.", comment: "So comfortable and stylish!", date: "2024-01-08", rating: 5 }
    ],
    '3': [
        { user: "Mike T.", comment: "Bought this for my wife, she loves it!", date: "2024-01-12", rating: 5 }
    ]
    // Add more comments for other products as needed
};

function getCommentCount(productId) {
    return productComments[productId] ? productComments[productId].length : 0;
}

function getAverageRating(productId) {
    if (!productComments[productId] || productComments[productId].length === 0) {
        return 4.8; // Default rating if no comments
    }
    
    const total = productComments[productId].reduce((sum, comment) => sum + comment.rating, 0);
    return (total / productComments[productId].length).toFixed(1);
}

// Initialize lazy loading if supported
if ('IntersectionObserver' in window) {
    document.addEventListener('DOMContentLoaded', initializeLazyLoading);
}