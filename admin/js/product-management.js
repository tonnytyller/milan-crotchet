// Product Management System
console.log('🛍️ Loading product management...');

class ProductManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.selectedProducts = new Set();
        this.currentEditingId = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        console.log('🚀 Initializing product manager...');
        
        // Check admin session first
        if (!initializeAdminSession()) {
            console.error('❌ Admin session check failed');
            return;
        }

        // Load and display products
        this.loadProducts();
        
        // Set up event listeners
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('✅ Product manager initialized');
    }

    // Load products data
    async loadProducts() {
        console.log('📦 Loading products data from database...');
        
        try {
            // Use real database data
            const products = await databaseService.getAllProducts();
            
            this.products = products;
            this.filteredProducts = [...products];
            this.renderProducts();
            
            console.log(`✅ Loaded ${products.length} products from database`);
        } catch (error) {
            console.error('❌ Error loading products from database:', error);
            this.showError('Failed to load products from database.');
        }
    }

    setupEventListeners() {
        console.log('🔗 Setting up event listeners...');

        // Search functionality
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Add product button
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.showAddProductModal());
        }

        const addFirstProductBtn = document.getElementById('addFirstProductBtn');
        if (addFirstProductBtn) {
            addFirstProductBtn.addEventListener('click', () => this.showAddProductModal());
        }

        // Bulk actions
        const bulkActionsBtn = document.getElementById('bulkActionsBtn');
        if (bulkActionsBtn) {
            bulkActionsBtn.addEventListener('click', () => this.toggleBulkActions());
        }

        const bulkCancelBtn = document.getElementById('bulkCancelBtn');
        if (bulkCancelBtn) {
            bulkCancelBtn.addEventListener('click', () => this.toggleBulkActions(false));
        }

        const bulkExportBtn = document.getElementById('bulkExportBtn');
        if (bulkExportBtn) {
            bulkExportBtn.addEventListener('click', () => this.exportSelectedProducts());
        }

        const bulkEditBtn = document.getElementById('bulkEditBtn');
        if (bulkEditBtn) {
            bulkEditBtn.addEventListener('click', () => this.showBulkEditModal());
        }

        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => this.deleteSelectedProducts());
        }

        // Product form
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
        }

        const cancelProductBtn = document.getElementById('cancelProductBtn');
        if (cancelProductBtn) {
            cancelProductBtn.addEventListener('click', () => this.closeProductModal());
        }

        const closeProductModal = document.getElementById('closeProductModal');
        if (closeProductModal) {
            closeProductModal.addEventListener('click', () => this.closeProductModal());
        }

        // Bulk edit form
        const bulkEditForm = document.getElementById('bulkEditForm');
        if (bulkEditForm) {
            bulkEditForm.addEventListener('submit', (e) => this.handleBulkEditSubmit(e));
        }

        const cancelBulkEditBtn = document.getElementById('cancelBulkEditBtn');
        if (cancelBulkEditBtn) {
            cancelBulkEditBtn.addEventListener('click', () => this.closeBulkEditModal());
        }

        const closeBulkEditModal = document.getElementById('closeBulkEditModal');
        if (closeBulkEditModal) {
            closeBulkEditModal.addEventListener('click', () => this.closeBulkEditModal());
        }

        // Image upload
        this.setupImageUpload();

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeAllModals();
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllModals();
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('admin_token');
                window.location.href = 'index.html';
            });
        }

        console.log('✅ Event listeners setup complete');
    }

    setupImageUpload() {
        const uploadArea = document.getElementById('imageUploadArea');
        const imageInput = document.getElementById('imageInput');

        if (!uploadArea || !imageInput) return;

        uploadArea.addEventListener('click', () => imageInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleImageDrop(e.dataTransfer.files);
        });

        imageInput.addEventListener('change', (e) => {
            this.handleImageSelection(e.target.files);
        });
    }

    handleSearch(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (!term) {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.name.toLowerCase().includes(term) ||
                product.description?.toLowerCase().includes(term) ||
                product.category?.toLowerCase().includes(term) ||
                product.tags?.some(tag => tag.toLowerCase().includes(term))
            );
        }
        
        this.renderProducts();
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        const noProductsState = document.getElementById('noProductsState');

        if (!grid || !noProductsState) return;

        if (this.filteredProducts.length === 0) {
            grid.style.display = 'none';
            noProductsState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        noProductsState.style.display = 'none';

        grid.innerHTML = this.filteredProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-checkbox">
                    <input type="checkbox" class="product-select" data-id="${product.id}">
                </div>
                <div class="product-image">
                    ${product.images && product.images.length > 0 ? 
                        `<img src="${product.images[0]}" alt="${product.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">` :
                        `<div class="no-image">No Image</div>`
                    }
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description || 'No description'}</p>
                    <div class="product-meta">
                        <span class="product-price">KSh ${parseFloat(product.price).toFixed(2)}</span>
                        ${product.category ? `<span class="product-category">${product.category}</span>` : ''}
                    </div>
                    <div class="product-tags">
                        ${product.tags && product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-outline btn-sm" onclick="productManager.editProduct('${product.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="productManager.deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <div class="product-status ${product.is_active ? 'active' : 'inactive'}">
                        ${product.is_active ? 'Active' : 'Inactive'}
                    </div>
                </div>
            </div>
        `).join('');

        // Add selection handlers
        grid.querySelectorAll('.product-select').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const productId = e.target.dataset.id;
                if (e.target.checked) {
                    this.selectedProducts.add(productId);
                } else {
                    this.selectedProducts.delete(productId);
                }
                this.updateBulkActionsState();
            });
        });
    }

    updateBulkActionsState() {
        const selectedCount = document.getElementById('selectedCount');
        if (selectedCount) {
            selectedCount.textContent = `${this.selectedProducts.size} products selected`;
        }
    }

    toggleBulkActions(show = true) {
        const panel = document.getElementById('bulkActionsPanel');
        if (panel) {
            panel.style.display = show ? 'block' : 'none';
        }
        
        // Clear selections when hiding
        if (!show) {
            this.selectedProducts.clear();
            this.renderProducts();
        }
    }

    async showAddProductModal() {
        this.currentEditingId = null;
        document.getElementById('productModalTitle').textContent = 'Add New Product';
        document.getElementById('productForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('productActive').checked = true;
        
        await this.populateCategories();
        this.showModal('productModal');
    }

    async editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.currentEditingId = productId;
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        
        // Fill form with product data
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productTags').value = product.tags ? product.tags.join(', ') : '';
        document.getElementById('productActive').checked = product.is_active !== false;

        // Show existing images
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.innerHTML = '';
        if (product.images && product.images.length > 0) {
            product.images.forEach(imageUrl => {
                this.addImageToPreview(imageUrl, true);
            });
        }

        await this.populateCategories();
        this.showModal('productModal');
    }

    async populateCategories() {
        const categories = [...new Set(this.products.map(p => p.category).filter(Boolean))];
        const datalist = document.getElementById('categoriesList');
        datalist.innerHTML = categories.map(cat => `<option value="${cat}">`).join('');
    }

    async handleProductSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            category: formData.get('category') || null,
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            is_active: formData.get('is_active') === 'on'
        };

        try {
            const saveButton = document.getElementById('saveProductBtn');
            saveButton.disabled = true;
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            // Handle image uploads
            const imageFiles = Array.from(document.getElementById('imageInput').files);
            let imageUrls = [];

            if (imageFiles.length > 0) {
                imageUrls = await this.uploadImages(imageFiles);
            }

            // Include existing images if editing
            if (this.currentEditingId) {
                const existingProduct = this.products.find(p => p.id === this.currentEditingId);
                const existingImages = existingProduct.images || [];
                productData.images = [...existingImages, ...imageUrls];
            } else {
                productData.images = imageUrls;
            }

            let savedProduct;
            if (this.currentEditingId) {
                savedProduct = await databaseService.updateProduct(this.currentEditingId, productData);
            } else {
                savedProduct = await databaseService.createProduct(productData);
            }

            this.showNotification(`Product ${this.currentEditingId ? 'updated' : 'created'} successfully!`, 'success');
            this.closeProductModal();
            await this.loadProducts();

        } catch (error) {
            console.error('Error saving product:', error);
            this.showError('Failed to save product');
        } finally {
            const saveButton = document.getElementById('saveProductBtn');
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-save"></i> Save Product';
        }
    }

    async uploadImages(files) {
        const uploadPromises = files.map(file => databaseService.uploadProductImage(file));
        return await Promise.all(uploadPromises);
    }

    handleImageSelection(files) {
        this.processImageFiles(Array.from(files));
    }

    handleImageDrop(files) {
        this.processImageFiles(Array.from(files));
    }

    processImageFiles(files) {
        const imagePreview = document.getElementById('imagePreview');
        
        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                this.showError('Please select only image files');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                this.showError('Image size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                this.addImageToPreview(e.target.result, false, file);
            };
            reader.readAsDataURL(file);
        });
    }

    addImageToPreview(imageSrc, isExisting = false, file = null) {
        const imagePreview = document.getElementById('imagePreview');
        const imageId = 'img-' + Date.now();
        
        const imageElement = `
            <div class="preview-image" data-image-id="${imageId}">
                <img src="${imageSrc}" alt="Preview">
                ${!isExisting ? `<button type="button" class="remove-image" onclick="productManager.removeImagePreview('${imageId}')">&times;</button>` : ''}
                ${isExisting ? `<input type="hidden" name="existing_images[]" value="${imageSrc}">` : ''}
                ${file ? `<input type="hidden" name="new_images[]" data-file-name="${file.name}">` : ''}
            </div>
        `;
        
        imagePreview.insertAdjacentHTML('beforeend', imageElement);
    }

    removeImagePreview(imageId) {
        const element = document.querySelector(`[data-image-id="${imageId}"]`);
        if (element) element.remove();
    }

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            await databaseService.deleteProduct(productId);
            this.showNotification('Product deleted successfully', 'success');
            await this.loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showError('Failed to delete product');
        }
    }

    async deleteSelectedProducts() {
        if (this.selectedProducts.size === 0) return;
        
        if (!confirm(`Are you sure you want to delete ${this.selectedProducts.size} products? This action cannot be undone.`)) {
            return;
        }

        try {
            const deletePromises = Array.from(this.selectedProducts).map(id => 
                databaseService.deleteProduct(id)
            );
            
            await Promise.all(deletePromises);
            this.showNotification(`Deleted ${this.selectedProducts.size} products successfully`, 'success');
            this.toggleBulkActions(false);
            await this.loadProducts();
        } catch (error) {
            console.error('Error deleting products:', error);
            this.showError('Failed to delete some products');
        }
    }

    exportSelectedProducts() {
        const productsToExport = this.selectedProducts.size > 0 ? 
            this.products.filter(p => this.selectedProducts.has(p.id)) : 
            this.products;

        if (productsToExport.length === 0) {
            this.showError('No products to export');
            return;
        }

        const csv = this.convertToCSV(productsToExport);
        this.downloadCSV(csv, 'milancrochet-products.csv');
        this.showNotification(`Exported ${productsToExport.length} products`, 'success');
    }

    convertToCSV(products) {
        const headers = ['Name', 'Description', 'Price', 'Category', 'Tags', 'Active'];
        const rows = products.map(product => [
            `"${product.name.replace(/"/g, '""')}"`,
            `"${(product.description || '').replace(/"/g, '""')}"`,
            product.price,
            `"${product.category || ''}"`,
            `"${(product.tags || []).join(', ')}"`,
            product.is_active ? 'Yes' : 'No'
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    showBulkEditModal() {
        if (this.selectedProducts.size === 0) {
            this.showError('Please select products to edit');
            return;
        }
        this.showModal('bulkEditModal');
    }

    async handleBulkEditSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const updates = {};

        const price = formData.get('bulkPrice');
        if (price) updates.price = parseFloat(price);

        const category = formData.get('bulkCategory');
        if (category) updates.category = category;

        const active = document.getElementById('bulkActive').checked;
        updates.is_active = active;

        try {
            const updatePromises = Array.from(this.selectedProducts).map(id =>
                databaseService.updateProduct(id, updates)
            );

            await Promise.all(updatePromises);
            this.showNotification(`Updated ${this.selectedProducts.size} products`, 'success');
            this.closeBulkEditModal();
            this.toggleBulkActions(false);
            await this.loadProducts();
        } catch (error) {
            console.error('Error in bulk edit:', error);
            this.showError('Failed to update some products');
        }
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    closeProductModal() {
        document.getElementById('productModal').classList.remove('show');
        document.getElementById('imageInput').value = '';
    }

    closeBulkEditModal() {
        document.getElementById('bulkEditModal').classList.remove('show');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    showNotification(message, type = 'info') {
        // Create or use existing notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }
}

// Initialize product manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Product page loaded, initializing...');
    window.productManager = new ProductManager();
    window.productManager.initialize();
});

async function handleProductSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const isEdit = !!form.dataset.productId;
    const productId = form.dataset.productId;

    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const tags = document.getElementById('productTags').value.trim();
    const isActive = document.getElementById('productActive').checked;

    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0]; // Only handling 1 image for now

    let imageUrl = null;

    try {
        // ✅ Step 1: Upload image if present
        if (file) {
            imageUrl = await databaseService.uploadProductImage(file);
        }

        // ✅ Step 2: Build product data
        const productData = {
            name,
            price,
            description,
            category,
            tags,
            is_active: isActive,
            updated_at: new Date().toISOString(),
        };

        if (imageUrl) {
            productData.image_url = imageUrl;
        }

        // ✅ Step 3: Save or update product
        if (isEdit) {
            await databaseService.updateProduct(productId, productData);
        } else {
            productData.created_at = new Date().toISOString();
            await databaseService.createProduct(productData);
        }

        // ✅ Step 4: Refresh products list, close modal
        await ProductManager.loadProducts();
        closeProductModal();

    } catch (error) {
        console.error('❌ Error saving product:', error);
        alert('Failed to save product. Check console for details.');
    }
}
