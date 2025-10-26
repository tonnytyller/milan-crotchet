// Shop page functionality - CLEAN WORKING VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛍️ Shop page loaded');
    initializeShopPage();
});

async function initializeShopPage() {
    console.log('🔄 Initializing shop page...');
    
    // Initialize filters
    loadCategories();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize view mode
    setViewMode('grid');
    
    // Load products
    await loadShopProducts();
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

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadShopProducts();
            }, 300);
        });
    }
    
    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', loadShopProducts);
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

async function loadShopProducts() {
    console.log('🔄 Loading shop products...');
    
    const searchTerm = document.getElementById('searchInput')?.value || '';
    const selectedCategory = document.querySelector('.category-btn.active')?.dataset.category || 'All';
    const sortBy = document.getElementById('sortSelect')?.value || 'featured';
    
    let products = [];
    
    try {
        // Use the same approach as main.js
        if (window.ProductsService && typeof ProductsService.getFeaturedProducts === 'function') {
            console.log('🔄 Getting products from Supabase...');
            products = await ProductsService.getFeaturedProducts();
        } else {
            console.log('🔄 Getting products from mock data...');
            products = getFeaturedProducts();
        }
    } catch (error) {
        console.error('❌ Error loading products:', error);
        products = getFeaturedProducts();
    }
    
    // Filter and sort
    let filteredProducts = filterProductsFromArray(products, searchTerm, selectedCategory);
    let sortedProducts = sortProducts(filteredProducts, sortBy);
    
    console.log('🎯 Displaying', sortedProducts.length, 'products');
    displayShopProducts(sortedProducts);
    updateResultsCount(sortedProducts.length, products.length);
}

function displayShopProducts(products) {
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
    
    // Use main.js createProductCard function
    if (typeof createProductCard === 'function') {
        productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
    } else {
        // Fallback if main.js not loaded
        productsGrid.innerHTML = products.map(product => `
            <div class="product-card" onclick="navigateToProduct('${product.id}')">
                <div class="product-image">
                    <img src="${product.images ? product.images[0] : product.image}" alt="${product.name}" loading="lazy">
                    ${product.featured ? '<div class="product-badge">Featured</div>' : ''}
                    <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist('${product.id}')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
                <div class="product-content">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price-category">
                        <span class="product-price">${formatPrice(product.price)}</span>
                        <span class="product-category">${product.category}</span>
                    </div>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCartFromCard('${product.id}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Update wishlist buttons
    if (window.Wishlist) {
        Wishlist.updateWishlistButtons();
    }
}

// Helper function to filter products
function filterProductsFromArray(products, searchTerm = '', category = 'All') {
    return products.filter(product => {
        const matchesCategory = category === 'All' || product.category === category;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });
}

function updateResultsCount(showing, total) {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${showing} of ${total} products`;
    }
}

function filterByCategory(category) {
    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Reload products
    loadShopProducts();
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