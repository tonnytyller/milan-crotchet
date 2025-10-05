// Milan Crochet - Google Sheets Data Manager
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTsEcfhLrCH77Q_-wlB31WzdKZ1zem4_FEvPvvfBH1C0zGIqFAnyl501lwsBOoeg/exec';

class GoogleSheetsManager {
    constructor() {
        this.scriptUrl = GOOGLE_SCRIPT_URL;
        this.cache = null;
        this.lastFetch = 0;
        this.CACHE_DURATION = 30000; // 30 seconds
    }

    async loadProducts() {
        // Use cache to avoid too many requests
        const now = Date.now();
        if (this.cache && (now - this.lastFetch) < this.CACHE_DURATION) {
            console.log('📦 Using cached products');
            return this.cache;
        }

        try {
            console.log('🌐 Loading products from Google Sheets...');
            const response = await fetch(`${this.scriptUrl}?action=getProducts`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const products = await response.json();
            
            // Validate response
            if (!Array.isArray(products)) {
                throw new Error('Invalid response format from server');
            }
            
            console.log(`✅ Loaded ${products.length} products from Google Sheets`);
            
            // Cache the results
            this.cache = products;
            this.lastFetch = now;
            
            return products;
        } catch (error) {
            console.error('❌ Error loading products:', error);
            
            // Return cached data if available, otherwise empty array
            return this.cache || [];
        }
    }

    async addProduct(productData) {
        try {
            console.log('➕ Adding product to Google Sheets...', productData);
            
            const params = new URLSearchParams();
            params.append('action', 'addProduct');
            
            // Add all product data as parameters
            Object.keys(productData).forEach(key => {
                if (Array.isArray(productData[key])) {
                    params.append(key, productData[key].join(', '));
                } else {
                    params.append(key, productData[key]);
                }
            });
            
            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Product added to Google Sheets');
                // Clear cache to force refresh
                this.cache = null;
                return result;
            } else {
                throw new Error(result.error || 'Failed to add product');
            }
        } catch (error) {
            console.error('❌ Error adding product:', error);
            throw error;
        }
    }
}

// Create global instance
const sheetsManager = new GoogleSheetsManager();

// Update all existing functions to use Google Sheets
window.getProductById = async function(id) {
    const products = await sheetsManager.loadProducts();
    return products.find(product => product.id === id);
};

window.getFeaturedProducts = async function() {
    const products = await sheetsManager.loadProducts();
    return products.filter(product => product.featured && product.inStock !== false);
};

window.filterProducts = async function(searchTerm = '', category = 'All') {
    const products = await sheetsManager.loadProducts();
    
    return products.filter(product => {
        const matchesCategory = category === 'All' || product.category === category;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch && product.inStock !== false;
    });
};

// Keep utility functions
window.formatPrice = function(price) {
    return `KSh ${price.toLocaleString()}`;
};

window.getColorStyle = function(color) {
    const colorMap = {
        'pink': '#ec4899', 'blue': '#3b82f6', 'green': '#10b981',
        'yellow': '#f59e0b', 'white': '#ffffff', 'purple': '#8b5cf6',
        'red': '#ef4444', 'orange': '#f97316', 'brown': '#a3a3a3',
        'black': '#111827', 'gray': '#6b7280', 'beige': '#d4b896'
    };
    
    const colorKey = color.toLowerCase().split(' ')[0];
    return colorMap[colorKey] || '#6b7280';
};

// Initialize and test
console.log('📊 Google Sheets Manager initialized');

// Test the connection on load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Testing Google Sheets connection...');
    const products = await sheetsManager.loadProducts();
    console.log(`🏪 Website now has ${products.length} products from Google Sheets`);
});
