// Main JavaScript file for homepage and common functionality
console.log('🚀 Main.js loaded');

// Global error handler to catch syntax errors in other files
window.addEventListener('error', function(e) {
    console.error('❌ Global error caught:', e.error);
    console.error('📁 File:', e.filename);
    console.error('📄 Line:', e.lineno);
    console.error('🔧 Column:', e.colno);
});

// Wait for everything to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM fully loaded');
    
    try {
        // Initialize mobile menu
        initializeMobileMenu();
        
        // Load featured products with delay to ensure Supabase is ready
        setTimeout(async () => {
            try {
                if (document.getElementById('featuredProducts')) {
                    console.log('🔄 Starting to load featured products...');
                    await loadFeaturedProducts();
                    
                    // RESTORE CART PRODUCTS FROM SUPABASE
                    if (window.cart && cart.restoreCartProducts) {
                        console.log('🔄 Restoring cart products...');
                        await cart.restoreCartProducts();
                    }
                }
            } catch (error) {
                console.error('❌ Error in featured products loading:', error);
            }
        }, 100);
        
        // Initialize newsletter form
        initializeNewsletterForm();
        
        // Initialize user button handlers
        initializeUserButtons();
        
    } catch (error) {
        console.error('❌ Main initialization error:', error);
    }
});

// Mobile menu functionality
function initializeMobileMenu() {
    try {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                const isOpen = mobileMenu.style.display === 'block';
                mobileMenu.style.display = isOpen ? 'none' : 'block';
                
                // Update button icon
                const icon = mobileMenuBtn.querySelector('svg');
                if (icon) {
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
                }
            });
            
            // Close mobile menu when clicking on links
            const mobileNavLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', function() {
                    mobileMenu.style.display = 'none';
                    const icon = mobileMenuBtn.querySelector('svg');
                    if (icon) {
                        icon.innerHTML = `
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        `;
                    }
                });
            });
        } else {
            console.warn('⚠️ Mobile menu elements not found');
        }
    } catch (error) {
        console.error('❌ Mobile menu initialization error:', error);
    }
}

// Load featured products
async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    try {
        console.log('🔄 Loading featured products from Supabase...');
        
        // Try to load from Supabase if available
        if (window.ProductsService) {
            const products = await ProductsService.getFeaturedProducts();
            
            if (products && products.length > 0) {
                console.log('✅ Loaded', products.length, 'products from Supabase');
                container.innerHTML = products.map(product => createProductCard(product)).join('');
                if (window.Wishlist) {
                    Wishlist.updateWishlistButtons();
                }
                return;
            }
        }
        
        // Fallback to mock data
        console.log('📦 Using mock data for products');
        const featuredProducts = getFeaturedProducts();
        if (featuredProducts && featuredProducts.length > 0) {
            container.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');
            if (window.Wishlist) {
                Wishlist.updateWishlistButtons();
            }
        } else {
            container.innerHTML = '<div class="loading">No products available</div>';
        }
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        // Fallback to mock data
        const featuredProducts = getFeaturedProducts();
        if (container && featuredProducts) {
            container.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');
        }
    }
}

// Create product card
function createProductCard(product) {
    try {
        // Handle both real and mock products
        const productId = product.id;
        const productName = product.name;
        const productDescription = product.description;
        const productPrice = product.price;
        const productCategory = product.category;
        const productImage = product.images ? product.images[0] : (product.image || 'images/placeholder.jpg');
        const productColors = product.tags || product.colors || [];
        
        const colors = productColors.slice(0, 3).map(color => `
            <div class="color-dot" style="background-color: ${getColorStyle(color)}" title="${color}"></div>
        `).join('');
        
        const moreColors = productColors.length > 3 ? `
            <span class="color-more">+${productColors.length - 3} more</span>
        ` : '';

        return `
            <div class="product-card" onclick="navigateToProduct('${productId}')">
                <div class="product-image">
                    <img src="${productImage}" alt="${productName}" loading="lazy">
                    ${product.featured ? '<div class="product-badge">Featured</div>' : ''}
                    <button class="wishlist-btn" data-id="${productId}" onclick="event.stopPropagation(); toggleWishlist('${productId}', event)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
                <div class="product-content">
                    <div class="product-header">
                        <h3 class="product-title">${productName}</h3>
                        <div class="product-rating">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                            </svg>
                            <span>4.8</span>
                        </div>
                    </div>
                    <p class="product-description">${productDescription}</p>
                    <div class="product-price-category">
                        <span class="product-price">${formatPrice(productPrice)}</span>
                        <span class="product-category">${productCategory}</span>
                    </div>
                    ${colors ? `<div class="product-colors">${colors}${moreColors}</div>` : ''}
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCartFromCard('${productId}')">
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
    } catch (error) {
        console.error('❌ Error creating product card:', error);
        return '<div class="product-card error">Error loading product</div>';
    }
}

// Navigation functions
function navigateTo(url) {
    window.location.href = url;
}

function navigateToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Add to cart from product card - FIXED VERSION
async function addToCartFromCard(productId) {
    console.log('🛒 Adding to cart, product ID:', productId, 'Type:', typeof productId);
    
    try {
        let product = null;
        let source = 'none';
        
        // Try to get product from Supabase first
        if (window.ProductsService && ProductsService.getProductById) {
            console.log('🔍 Looking in Supabase...');
            product = await ProductsService.getProductById(productId);
            if (product) {
                source = 'supabase';
                console.log('✅ Found in Supabase:', product.name);
            } else {
                console.log('❌ Not found in Supabase');
            }
        }
        
        // If not found in Supabase, try mock data as fallback
        if (!product && window.getProductById) {
            console.log('🔍 Looking in mock data...');
            product = getProductById(productId);
            if (product) {
                source = 'mock';
                console.log('✅ Found in mock data:', product.name);
            } else {
                console.log('❌ Not found in mock data either');
            }
        }
        
        console.log('📋 Product lookup result:', {
            found: !!product,
            source: source,
            product: product
        });
        
        // FIXED: This condition was wrong - it should just check if product exists
        if (product) {
            console.log('✅ Product found, adding to cart:', product.name);
            
            // Make sure cart exists
            if (window.cart) {
                const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
                const defaultColor = (product.colors && product.colors.length > 0) ? product.colors[0] : null;
                cart.addItem(product, 1, defaultSize, defaultColor);
            } else {
                console.error('❌ Cart not available');
                alert('Cart system not available. Please refresh the page.');
            }
        } else {
            console.error('❌ Product not found in any source:', productId);
            alert('Sorry, this product is not available right now.');
        }
    } catch (error) {
        console.error('❌ Error adding to cart:', error);
        alert('Error adding product to cart: ' + error.message);
    }
}

// Newsletter form
function initializeNewsletterForm() {
    try {
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
    } catch (error) {
        console.error('❌ Newsletter form error:', error);
    }
}

// User button handlers
function initializeUserButtons() {
    try {
        const userBtn = document.getElementById('userBtn');
        const mobileUserBtn = document.getElementById('mobileUserBtn');
        
        if (userBtn) {
            userBtn.addEventListener('click', async function(e) {
                if (window.authManager && window.authManager.currentUser) {
                    window.location.href = 'profile.html';
                } else {
                    window.location.href = 'login.html?redirect=profile';
                }
            });
        }
        
        if (mobileUserBtn) {
            mobileUserBtn.addEventListener('click', async function(e) {
                if (window.authManager && window.authManager.currentUser) {
                    window.location.href = 'profile.html';
                } else {
                    window.location.href = 'login.html?redirect=profile';
                }
            });
        }
    } catch (error) {
        console.error('❌ User buttons error:', error);
    }
}

// Lazy loading for images
function initializeLazyLoading() {
    try {
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
    } catch (error) {
        console.error('❌ Lazy loading error:', error);
    }
}

// Initialize lazy loading if supported
if ('IntersectionObserver' in window) {
    document.addEventListener('DOMContentLoaded', initializeLazyLoading);
}

// Wishlist function
function toggleWishlist(productId, event) {
    try {
        if (event) {
            event.stopPropagation();
        }
        if (window.Wishlist) {
            Wishlist.toggleItem(productId);
        } else {
            console.log('Wishlist not available');
        }
    } catch (error) {
        console.error('❌ Wishlist error:', error);
    }
}

// Fallback functions if they don't exist
if (typeof getColorStyle === 'undefined') {
    window.getColorStyle = function(color) {
        const colorMap = {
            'red': '#ef4444',
            'blue': '#3b82f6',
            'green': '#22c55e',
            'yellow': '#eab308',
            'pink': '#ec4899',
            'purple': '#a855f7',
            'black': '#000000',
            'white': '#ffffff'
        };
        return colorMap[color.toLowerCase()] || '#6b7280';
    };
}

if (typeof formatPrice === 'undefined') {
    window.formatPrice = function(price) {
        return `KSh ${price?.toLocaleString() || '0'}`;
    };
}

window.uploadProductImage = async function(file) {
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
};
