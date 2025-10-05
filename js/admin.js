// Milan Crochet Admin Panel - FIXED VERSION
class AdminManager {
  // Add these methods to AdminManager class

showAddProductForm() {
    const modal = document.getElementById('addProductModal');
    if (!modal) {
        this.createProductModal();
    } else {
        modal.style.display = 'block';
    }
    
    document.getElementById('addProductForm').innerHTML = this.getProductFormHTML();
    this.setupProductForm();
}

createProductModal() {
    const modalHTML = `
        <div class="modal" id="addProductModal" style="display: block;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Add New Product</h2>
                    <button class="close-modal" onclick="admin.closeModal()">&times;</button>
                </div>
                <form id="addProductForm">
                    ${this.getProductFormHTML()}
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

getProductFormHTML(product = {}) {
    const isEdit = product.id;
    
    return `
        <div class="form-group">
            <label class="form-label">Product Name *</label>
            <input type="text" class="form-input" id="productName" 
                   value="${product.name || ''}" required placeholder="e.g., Beautiful Crochet Dress">
        </div>
        
        <div class="form-group">
            <label class="form-label">Description *</label>
            <textarea class="form-textarea" id="productDescription" required 
                      placeholder="Describe the product...">${product.description || ''}</textarea>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Price (KSh) *</label>
                <input type="number" class="form-input" id="productPrice" 
                       value="${product.price || ''}" required min="100" placeholder="1500">
            </div>
            <div class="form-group">
                <label class="form-label">Category *</label>
                <select class="form-select" id="productCategory" required>
                    <option value="">Select Category</option>
                    <option value="Women" ${product.category === 'Women' ? 'selected' : ''}>Women</option>
                    <option value="Men" ${product.category === 'Men' ? 'selected' : ''}>Men</option>
                    <option value="Hats & Bennies" ${product.category === 'Hats & Bennies' ? 'selected' : ''}>Hats & Bennies</option>
                    <option value="Bags" ${product.category === 'Bags' ? 'selected' : ''}>Bags</option>
                    <option value="Accessories" ${product.category === 'Accessories' ? 'selected' : ''}>Accessories</option>
                    <option value="Blankets" ${product.category === 'Blankets' ? 'selected' : ''}>Blankets</option>
                    <option value="Children" ${product.category === 'Children' ? 'selected' : ''}>Children</option>
                </select>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Production Time (days)</label>
                <input type="number" class="form-input" id="productProductionTime" 
                       value="${product.productionTime || 3}" min="1" max="30">
            </div>
            <div class="form-group">
                <label class="form-label">Ready Stock</label>
                <input type="number" class="form-input" id="productReadyStock" 
                       value="${product.readyStock || 0}" min="0">
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Sizes (comma separated)</label>
            <input type="text" class="form-input" id="productSizes" 
                   value="${product.sizes ? product.sizes.join(', ') : 'XS, S, M, L, XL'}" 
                   placeholder="XS, S, M, L, XL">
        </div>
        
        <div class="form-group">
            <label class="form-label">Colors (comma separated)</label>
            <input type="text" class="form-input" id="productColors" 
                   value="${product.colors ? product.colors.join(', ') : 'Red, Blue, Green'}" 
                   placeholder="Red, Blue, Green, etc.">
        </div>
        
        <div class="form-group">
            <label class="form-label">Image URL</label>
            <input type="text" class="form-input" id="productImage" 
                   value="${product.images ? product.images[0] : ''}" 
                   placeholder="images/product-name.jpg">
            <small style="color: #6b7280;">Use images/your-image.jpg for local images</small>
        </div>
        
        <div class="form-group">
            <label class="form-label">
                <input type="checkbox" id="productFeatured" ${product.featured ? 'checked' : ''}>
                Featured Product (shows on homepage)
            </label>
        </div>
        
        <div class="form-group">
            <label class="form-label">
                <input type="checkbox" id="productInStock" ${product.inStock !== false ? 'checked' : ''}>
                In Stock (customers can purchase)
            </label>
        </div>
        
        ${isEdit ? `<input type="hidden" id="productId" value="${product.id}">` : ''}
        
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="admin.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Update Product' : 'Add Product'}</button>
        </div>
    `;
}

setupProductForm() {
    const form = document.getElementById('addProductForm');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveProduct();
        };
    }
}

saveProduct() {
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseInt(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        productionTime: parseInt(document.getElementById('productProductionTime').value) || 3,
        readyStock: parseInt(document.getElementById('productReadyStock').value) || 0,
        sizes: document.getElementById('productSizes').value.split(',').map(s => s.trim()).filter(s => s),
        colors: document.getElementById('productColors').value.split(',').map(c => c.trim()).filter(c => c),
        images: [document.getElementById('productImage').value || 'images/placeholder.jpg'],
        featured: document.getElementById('productFeatured').checked,
        inStock: document.getElementById('productInStock').checked
    };

    // Check if editing existing product
    const existingProductId = document.getElementById('productId')?.value;
    
    if (existingProductId) {
        this.updateProduct(existingProductId, productData);
    } else {
        this.addProduct(productData);
    }
}

addProduct(productData) {
    const products = JSON.parse(localStorage.getItem('milan-products') || '[]');
    
    const newProduct = {
        id: 'prod-' + Date.now(),
        ...productData,
        createdAt: new Date().toISOString(),
        inStock: productData.inStock !== false
    };
    
    products.push(newProduct);
    localStorage.setItem('milan-products', JSON.stringify(products));
    
    // Show success message with product details
    alert(`✅ Product Added Successfully!\n\n📝 ${newProduct.name}\n💰 KSh ${newProduct.price.toLocaleString()}\n📦 ${newProduct.category}\n🛠️ ${newProduct.productionTime} days production`);
    
    this.closeModal();
    this.loadProducts(); // Refresh the products list
    
    console.log('New product saved:', newProduct);
}

updateProduct(productId, productData) {
    const products = JSON.parse(localStorage.getItem('milan-products') || '[]');
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex !== -1) {
        products[productIndex] = {
            ...products[productIndex],
            ...productData,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('milan-products', JSON.stringify(products));
        alert('✅ Product updated successfully!');
        this.closeModal();
        this.loadProducts();
    }
}

editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('milan-products') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (product) {
        this.createProductModal();
        document.getElementById('addProductForm').innerHTML = this.getProductFormHTML(product);
        this.setupProductForm();
    }
}

closeModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.remove();
    }
}
    constructor() {
        console.log('AdminManager constructor called');
        this.isAuthenticated = localStorage.getItem('admin-authenticated') === 'true';
        this.adminPassword = "milan2024";
        this.init();
    }

    init() {
        console.log('AdminManager init called');
        console.log('Current auth status:', this.isAuthenticated);
        
        this.checkAuthentication();
        this.setupEventListeners();
        
        if (window.location.href.includes('admin-dashboard')) {
            this.loadDashboardData();
        }
    }

    authenticate(password) {
        console.log('Authentication attempt with password:', password);
        
        if (password === this.adminPassword) {
            localStorage.setItem('admin-authenticated', 'true');
            this.isAuthenticated = true;
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem('admin-authenticated');
        this.isAuthenticated = false;
        window.location.href = 'admin-login.html';
    }

    checkAuthentication() {
        if (!this.isAuthenticated && !window.location.href.includes('admin-login.html')) {
            window.location.href = 'admin-login.html';
        } else if (this.isAuthenticated && window.location.href.includes('admin-login.html')) {
            window.location.href = 'admin-dashboard.html';
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const password = document.getElementById('adminPassword').value;
                
                if (this.authenticate(password)) {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    alert('Invalid admin password. Try: milan2024');
                }
            });
        }

        // Tab switching
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.tab) {
                link.addEventListener('click', (e) => {
                    const tab = e.target.dataset.tab;
                    this.switchTab(tab);
                });
            }
        });
    }

    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        
        // Hide all tabs
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.tab === tabName) {
                link.classList.add('active');
            }
        });
        
        // Load data for the tab
        switch(tabName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'customers':
                this.loadCustomers();
                break;
        }
    }

    loadDashboardData() {
        console.log('Loading dashboard data...');
        
        setTimeout(() => {
            this.loadOrderStats();
            this.loadRecentOrders();
        }, 100);
    }

    loadOrderStats() {
        const orders = JSON.parse(localStorage.getItem('milan-orders') || '[]');
        const products = JSON.parse(localStorage.getItem('milan-products') || '[]');
        
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'pending_verification').length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalProducts = products.length;

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('pendingOrders').textContent = pendingOrders;
        document.getElementById('totalRevenue').textContent = this.formatPrice(totalRevenue);
        document.getElementById('totalProducts').textContent = totalProducts;
    }

    loadRecentOrders() {
        const orders = JSON.parse(localStorage.getItem('milan-orders') || '[]');
        const recentOrders = orders.slice(-5).reverse();
        
        const ordersHTML = recentOrders.map(order => `
            <div class="order-item">
                <div class="order-info">
                    <strong>${order.orderNumber}</strong>
                    <span>${order.customer?.fullName || 'N/A'}</span>
                    <span>${this.formatPrice(order.total || 0)}</span>
                    <span class="status-badge ${order.status || 'pending'}">${order.status || 'pending'}</span>
                </div>
                <div class="order-actions">
                    <button onclick="admin.viewOrder('${order.orderNumber}')" class="btn btn-sm">View</button>
                    ${order.status === 'pending_verification' ? 
                        `<button onclick="admin.verifyPayment('${order.orderNumber}')" class="btn btn-sm btn-success">Verify</button>` : ''
                    }
                </div>
            </div>
        `).join('');
        
        document.getElementById('recentOrders').innerHTML = ordersHTML || '<p>No recent orders</p>';
    }

    loadOrders() {
        const orders = JSON.parse(localStorage.getItem('milan-orders') || '[]');
        
        const ordersHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-info">
                    <strong>${order.orderNumber}</strong>
                    <span>${order.customer?.fullName || 'N/A'}</span>
                    <span>${this.formatPrice(order.total || 0)}</span>
                    <span class="status-badge ${order.status || 'pending'}">${order.status || 'pending'}</span>
                    <small>${new Date(order.orderDate).toLocaleDateString()}</small>
                </div>
                <div class="order-actions">
                    <button onclick="admin.viewOrder('${order.orderNumber}')" class="btn btn-sm">View</button>
                    ${order.status === 'pending_verification' ? 
                        `<button onclick="admin.verifyPayment('${order.orderNumber}')" class="btn btn-sm btn-success">Verify</button>` : ''
                    }
                </div>
            </div>
        `).join('');
        
        document.getElementById('ordersList').innerHTML = ordersHTML || '<p>No orders found</p>';
    }

    loadProducts() {
        const products = JSON.parse(localStorage.getItem('milan-products') || '[]');
        
        const productsHTML = products.map(product => `
            <div class="product-card admin-product-card">
                <img src="${product.images?.[0] || 'images/placeholder.jpg'}" alt="${product.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEM0NC40MTgzIDQwIDQ4IDM2LjQxODMgNDggMzJDNDggMjcuNTgxNyA0NC40MTgzIDI0IDQwIDI0QzM1LjU4MTcgMjQgMzIgMjcuNTgxNyAzMiAzMkMzMiAzNi40MTgzIDM1LjU4MTcgNDAgNDAgNDBaIiBmaWxsPSIjZDlkYWRjIi8+CjxwYXRoIGQ9Ik00OCAyN0g0OEg0OFoiIGZpbGw9IiNkOWRhZGMiLz4KPC9zdmc+'">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p>${this.formatPrice(product.price)} • ${product.category}</p>
                    <p>Stock: ${product.readyStock || 0} • Production: ${product.productionTime || 3} days</p>
                </div>
                <div class="product-actions">
                    <button onclick="admin.editProduct('${product.id}')" class="btn btn-sm">Edit</button>
                    <button onclick="admin.deleteProduct('${product.id}')" class="btn btn-sm btn-danger">Delete</button>
                </div>
            </div>
        `).join('');
        
        document.getElementById('productsGrid').innerHTML = productsHTML || '<p>No products found</p>';
    }

    loadCustomers() {
        const orders = JSON.parse(localStorage.getItem('milan-orders') || '[]');
        
        const customers = {};
        orders.forEach(order => {
            if (order.customer && order.customer.phoneNumber) {
                const key = order.customer.phoneNumber;
                if (!customers[key]) {
                    customers[key] = {
                        ...order.customer,
                        orderCount: 0,
                        totalSpent: 0
                    };
                }
                customers[key].orderCount++;
                customers[key].totalSpent += order.total || 0;
            }
        });
        
        const customersArray = Object.values(customers);
        const customersHTML = customersArray.map(customer => `
            <div class="customer-item">
                <div class="customer-info">
                    <strong>${customer.fullName}</strong>
                    <span>${customer.phoneNumber}</span>
                    <span>Orders: ${customer.orderCount}</span>
                    <span>Total: ${this.formatPrice(customer.totalSpent)}</span>
                </div>
            </div>
        `).join('');
        
        document.getElementById('customersList').innerHTML = customersHTML || '<p>No customers found</p>';
    }

    verifyPayment(orderNumber) {
        const orders = JSON.parse(localStorage.getItem('milan-orders') || '[]');
        const orderIndex = orders.findIndex(order => order.orderNumber === orderNumber);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = 'confirmed';
            orders[orderIndex].payment.verified = true;
            orders[orderIndex].verifiedAt = new Date().toISOString();
            
            localStorage.setItem('milan-orders', JSON.stringify(orders));
            
            this.sendVerificationConfirmation(orders[orderIndex]);
            alert(`Payment for order ${orderNumber} verified successfully!`);
            this.loadDashboardData();
        }
    }

    sendVerificationConfirmation(order) {
        const message = `✅ PAYMENT VERIFIED - Milan Crochet\n\nOrder #: ${order.orderNumber}\nAmount: KSh ${order.total}\nStatus: ✅ Payment Confirmed\n\nWe're now starting production!`;
        const whatsappUrl = `https://wa.me/${order.customer.phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    viewOrder(orderNumber) {
        const orders = JSON.parse(localStorage.getItem('milan-orders') || '[]');
        const order = orders.find(o => o.orderNumber === orderNumber);
        
        if (order) {
            alert(`Order: ${order.orderNumber}\nCustomer: ${order.customer.fullName}\nPhone: ${order.customer.phoneNumber}\nAmount: ${this.formatPrice(order.total)}\nStatus: ${order.status}`);
        }
    }

    formatPrice(price) {
        return `KSh ${parseInt(price || 0).toLocaleString()}`;
    }

    showAddProductForm() {
    console.log('🎯 Opening complete product form');
    
    // Remove any existing modal first
    const existingModal = document.getElementById('addProductModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create complete product form modal
    const modalHTML = `
        <div class="modal" id="addProductModal" style="display: block; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; overflow-y: auto;">
            <div style="background: white; margin: 20px auto; padding: 30px; border-radius: 12px; max-width: 700px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f3f4f6;">
                    <h2 style="margin: 0; color: #111827; font-size: 1.5rem;">➕ Add New Product</h2>
                    <button onclick="admin.closeModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 5px;">&times;</button>
                </div>
                
                <form id="addProductForm" style="max-height: 70vh; overflow-y: auto; padding-right: 10px;">
                    <!-- Product Basic Information -->
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 15px 0; color: #374151;">📝 Basic Information</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Product Name *</label>
                                <input type="text" id="productName" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" 
                                       placeholder="e.g., Beautiful Crochet Dress" required>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Category *</label>
                                <select id="productCategory" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" required>
                                    <option value="">Select Category</option>
                                    <option value="Women">👚 Women</option>
                                    <option value="Men">👔 Men</option>
                                    <option value="Hats & Bennies">🧢 Hats & Bennies</option>
                                    <option value="Bags">👜 Bags</option>
                                    <option value="Accessories">💍 Accessories</option>
                                    <option value="Blankets">🛏️ Blankets</option>
                                    <option value="Children">👶 Children</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Product Description *</label>
                            <textarea id="productDescription" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; min-height: 100px; resize: vertical;" 
                                      placeholder="Describe your product in detail... What makes it special? Materials used? Size information?" required></textarea>
                        </div>
                    </div>

                    <!-- Pricing & Inventory -->
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 15px 0; color: #374151;">💰 Pricing & Inventory</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Price (KSh) *</label>
                                <input type="number" id="productPrice" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" 
                                       placeholder="1500" min="100" required>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Production Time (days)</label>
                                <input type="number" id="productProductionTime" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" 
                                       value="3" min="1" max="30">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Ready Stock</label>
                                <input type="number" id="productReadyStock" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" 
                                       value="0" min="0">
                            </div>
                        </div>
                    </div>

                    <!-- Sizes & Colors -->
                    <div style="background: #fdf2f8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 15px 0; color: #374151;">🎨 Sizes & Colors</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Available Sizes *</label>
                                <input type="text" id="productSizes" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" 
                                       value="XS, S, M, L, XL" placeholder="XS, S, M, L, XL" required>
                                <small style="color: #6b7280; font-size: 12px;">Separate sizes with commas</small>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Available Colors *</label>
                                <input type="text" id="productColors" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" 
                                       value="Red, Blue, Green, Black, White" placeholder="Red, Blue, Green, etc." required>
                                <small style="color: #6b7280; font-size: 12px;">Separate colors with commas</small>
                            </div>
                        </div>
                    </div>

                    <!-- Images -->
                    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 15px 0; color: #374151;">🖼️ Product Images</h3>
                        
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Main Image URL *</label>
                            <input type="text" id="productImage" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" 
                                   value="images/placeholder.jpg" placeholder="images/your-product-image.jpg" required>
                            <small style="color: #6b7280; font-size: 12px;">
                                💡 Use: images/your-image.jpg for local images<br>
                                💡 You can add more images later by editing the product
                            </small>
                        </div>
                    </div>

                    <!-- Product Settings -->
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 15px 0; color: #374151;">⚙️ Product Settings</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; cursor: pointer;">
                                    <input type="checkbox" id="productFeatured" style="width: 18px; height: 18px;">
                                    <span style="font-weight: 600; color: #374151;">⭐ Featured Product</span>
                                </label>
                                <small style="color: #6b7280; font-size: 12px;">Show on homepage</small>
                            </div>
                            
                            <div>
                                <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; cursor: pointer;">
                                    <input type="checkbox" id="productInStock" checked style="width: 18px; height: 18px;">
                                    <span style="font-weight: 600; color: #374151;">📦 In Stock</span>
                                </label>
                                <small style="color: #6b7280; font-size: 12px;">Available for purchase</small>
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 25px; padding-top: 20px; border-top: 2px solid #f3f4f6;">
                        <button type="button" onclick="admin.closeModal()" 
                                style="padding: 12px 24px; background: #6b7280; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                            ❌ Cancel
                        </button>
                        <button type="submit" 
                                style="padding: 12px 24px; background: linear-gradient(135deg, #f97316, #ec4899); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                            ✅ Add Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup form submission
    const form = document.getElementById('addProductForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        this.saveCompleteProduct();
    };
    
    console.log('✅ Complete product form created!');
}

saveCompleteProduct() {
    console.log('💾 Saving complete product...');
    
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseInt(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        productionTime: parseInt(document.getElementById('productProductionTime').value) || 3,
        readyStock: parseInt(document.getElementById('productReadyStock').value) || 0,
        sizes: document.getElementById('productSizes').value.split(',').map(s => s.trim()).filter(s => s),
        colors: document.getElementById('productColors').value.split(',').map(c => c.trim()).filter(c => c),
        images: [document.getElementById('productImage').value || 'images/placeholder.jpg'],
        featured: document.getElementById('productFeatured').checked,
        inStock: document.getElementById('productInStock').checked
    };

    console.log('Product data:', productData);

    // Validate required fields
    if (!productData.name || !productData.description || !productData.price || !productData.category) {
        alert('❌ Please fill in all required fields (Name, Description, Price, Category)');
        return;
    }

    this.addProduct(productData);
}

    editProduct(productId) {
        alert(`Edit product ${productId} - to be implemented!`);
    }

    deleteProduct(productId) {
        if (confirm('Delete this product?')) {
            const products = JSON.parse(localStorage.getItem('milan-products') || '[]');
            const filteredProducts = products.filter(p => p.id !== productId);
            localStorage.setItem('milan-products', JSON.stringify(filteredProducts));
            this.loadProducts();
        }
    }
}

// Initialize admin panel
let admin;
try {
    admin = new AdminManager();
} catch (error) {
    console.error('Error initializing AdminManager:', error);
}

// Global functions
function logoutAdmin() {
    if (admin) admin.logout();
}

function exportOrders() {
    const orders = JSON.parse(localStorage.getItem('milan-orders') || '[]');
    const dataStr = JSON.stringify(orders, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `milan-orders-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Global navigation
window.navigateTo = function(url) {
    window.location.href = url;
};