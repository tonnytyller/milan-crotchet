// Shop page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeShopPage();
});

function initializeShopPage() {
    // Initialize filters
    loadCategories();
    loadProducts();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize view mode
    setViewMode('grid');
}

function loadCategories() {
    const categoryFilters = document.getElementById('categoryFilters');
    if (!categoryFilters) return;
    
    categoryFilters.innerHTML = categories.map(category => `
        <button class="category-btn ${category === 'All' ? 'active' : ''}" 
                data-category="${category}" 
                onclick="filterByCategory('${category}')">
            ${category}
        </button>
    `).join('');
}

function loadProducts() {
    const searchTerm = document.getElementById('searchInput')?.value || '';
    const selectedCategory = document.querySelector('.category-btn.active')?.dataset.category || 'All';
    const sortBy = document.getElementById('sortSelect')?.value || 'featured';
    
    let filteredProducts = filterProducts(searchTerm, selectedCategory);
    let sortedProducts = sortProducts(filteredProducts, sortBy);
    
    displayProducts(sortedProducts);
    updateResultsCount(sortedProducts.length, mockProducts.length);
}

function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    productsGrid.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" onclick="navigateToProduct('${product.id}')">
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                ${product.featured ? '<div class="product-badge">Featured</div>' : ''}
                <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist('${product.id}')">
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
    <span class="comment-count">(${getCommentCount(product.id)} reviews)</span>
</div>
                </div>
                <p class="product-description">${product.description}</p>
                <div class="product-price-category">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    <span class="product-category">${product.category}</span>
                </div>
                <div class="product-colors">
                    ${product.colors.slice(0, 3).map(color => `
                        <div class="color-dot" style="background-color: ${getColorStyle(color)}" title="${color}"></div>
                    `).join('')}
                    ${product.colors.length > 3 ? `
                        <span class="color-more">+${product.colors.length - 3} more</span>
                    ` : ''}
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
    `).join('');
}

function updateResultsCount(showing, total) {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${showing} of ${total} products`;
    }
}

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadProducts();
            }, 300);
        });
    }
    
    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', loadProducts);
    }
    
    // View toggle buttons
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => setViewMode('grid'));
    }
    
    if (listViewBtn) {
        listViewBtn.addEventListener('click', () => setViewMode('list'));
    }
}

function filterByCategory(category) {
    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Reload products
    loadProducts();
}

function setViewMode(mode) {
    const productsGrid = document.getElementById('productsGrid');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    
    if (!productsGrid) return;
    
    // Update grid classes
    productsGrid.className = `products-grid ${mode}-view`;
    
    // Update button states
    if (gridViewBtn && listViewBtn) {
        gridViewBtn.classList.toggle('active', mode === 'grid');
        listViewBtn.classList.toggle('active', mode === 'list');
    }
    
    // Store preference
    localStorage.setItem('shop-view-mode', mode);
}

// Load saved view mode
function loadViewMode() {
    const savedMode = localStorage.getItem('shop-view-mode') || 'grid';
    setViewMode(savedMode);
}

// Initialize view mode on load
document.addEventListener('DOMContentLoaded', loadViewMode);

// Navigation functions (make sure these are available globally)
function navigateToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

function addToCartFromCard(productId) {
    try {
        if (typeof getProductById === 'undefined') {
            alert('ERROR: getProductById function is not defined!');
            return;
        }
        
        if (typeof cart === 'undefined') {
            alert('ERROR: cart object is not defined!');
            return;
        }
        
        const product = getProductById(productId);
        if (product) {
            cart.addItem(product, 1);
        } else {
            alert(`ERROR: Could not find product with ID: ${productId}`);
        }
    } catch (error) {
        alert(`ERROR: ${error.message}`);
    }
}