// Milan Crochet Checkout - Fixed and Enhanced
class CheckoutManager {
    constructor() {
        this.paymentMethod = 'stk';
        this.deliveryCost = 200;
        this.isProcessing = false;
        
        // Don't call init here - wait for DOM to be ready
    }

    init() {
        console.log('Initializing checkout manager...');
        this.loadOrderSummary();
        this.setupEventListeners();
        this.updatePaymentDisplay();
        this.setupTransactionIdValidation();
        console.log('Enhanced checkout system initialized');
    }

    loadOrderSummary() {
        console.log('Loading order summary...');
        const orderItemsContainer = document.getElementById('orderItems');
        const subtotalElement = document.getElementById('subtotal');
        const deliveryCostElement = document.getElementById('deliveryCost');
        const totalAmountElement = document.getElementById('totalAmount');
        const transactionAmountElement = document.getElementById('transactionAmount');
        const stkTotalAmountElement = document.getElementById('stkTotalAmount');
        const transactionTotalAmountElement = document.getElementById('transactionTotalAmount');

        // Check if cart is available
        if (typeof cart === 'undefined' || !cart.items || cart.items.length === 0) {
            console.log('Cart is empty or not available');
            this.showEmptyCart();
            return;
        }

        console.log('Cart items found:', cart.items.length);

        // Render order items
        if (orderItemsContainer) {
            orderItemsContainer.innerHTML = cart.items.map(item => `
                <div class="order-item">
                    <img src="${item.product.images[0]}" alt="${item.product.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0zMCAzNUMzMi43NjE0IDM1IDM1IDMyLjc2MTQgMzUgMzBDMzUgMjcuMjM4NiAzMi43NjE0IDI1IDMwIDI1QzI3LjIzODYgMjUgMjUgMjcuMjM4NiAyNSAzMEMyNSAzMi43NjE0IDI3LjIzODYgMzUgMzAgMzVaIiBmaWxsPSIjZDlkYWRjIi8+CjxwYXRoIGQ9Ik0zNSAyMEgzNUgzNVoiIGZpbGw9IiNkOWRhZGMiLz4KPC9zdmc+'">
                    <div class="order-item-details">
                        <div class="order-item-name">${item.product.name}</div>
                        <div class="order-item-options">
                            ${item.selectedSize ? `Size: ${item.selectedSize} • ` : ''}
                            ${item.selectedColor ? `Color: ${item.selectedColor} • ` : ''}
                            Qty: ${item.quantity}
                        </div>
                        <div class="order-item-price">${this.formatPrice(item.product.price * item.quantity)}</div>
                    </div>
                </div>
            `).join('');
        }

        // Calculate totals
        const subtotal = cart.getTotal();
        const total = subtotal + this.deliveryCost;

        console.log('Calculated totals - Subtotal:', subtotal, 'Total:', total);

        // Update display
        if (subtotalElement) subtotalElement.textContent = this.formatPrice(subtotal);
        if (deliveryCostElement) deliveryCostElement.textContent = this.formatPrice(this.deliveryCost);
        if (totalAmountElement) totalAmountElement.textContent = this.formatPrice(total);
        
        // Update payment amounts
        if (transactionAmountElement) transactionAmountElement.textContent = this.formatPrice(total);
        if (stkTotalAmountElement) stkTotalAmountElement.textContent = this.formatPrice(total);
        if (transactionTotalAmountElement) transactionTotalAmountElement.textContent = this.formatPrice(total);

        this.validateForm();
    }

    formatPrice(price) {
        return `KSh ${price.toLocaleString()}`;
    }

    showEmptyCart() {
        const orderItemsContainer = document.getElementById('orderItems');
        if (orderItemsContainer) {
            orderItemsContainer.innerHTML = `
                <div style="text-align: center; color: #6b7280; padding: 2rem;">
                    <p>Your cart is empty</p>
                    <a href="shop.html" style="color: #f97316; text-decoration: none;">Continue Shopping</a>
                </div>
            `;
        }
        
        this.disablePaymentButtons();
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Payment method selection
        const paymentOptions = document.querySelectorAll('.payment-option');
        if (paymentOptions.length > 0) {
            paymentOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    if (this.isProcessing) return;
                    
                    document.querySelectorAll('.payment-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    e.currentTarget.classList.add('selected');
                    
                    this.paymentMethod = e.currentTarget.dataset.method;
                    this.updatePaymentDisplay();
                });
            });
        }

        // STK Pay button
        const stkPayBtn = document.getElementById('stkPayBtn');
        if (stkPayBtn) {
            stkPayBtn.addEventListener('click', () => this.processSTKPayment());
        }

        // Transaction Pay button
        const transactionPayBtn = document.getElementById('transactionPayBtn');
        if (transactionPayBtn) {
            transactionPayBtn.addEventListener('click', () => this.processTransactionPayment());
        }

        // Form validation on input
        const formInputs = ['fullName', 'phoneNumber', 'county', 'town', 'deliveryAddress'];
        formInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.validateForm());
            }
        });

        // Phone number formatting
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.startsWith('0')) {
                    value = value.substring(1);
                }
                if (value.length > 0) {
                    value = '0' + value;
                }
                if (value.length > 4) {
                    value = value.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
                }
                e.target.value = value;
                this.validateForm();
            });
        }

        console.log('Event listeners setup complete');
    }

    updatePaymentDisplay() {
        console.log('Updating payment display for method:', this.paymentMethod);
        
        // Show/hide instructions
        const stkInstructions = document.getElementById('stkInstructions');
        const transactionInstructions = document.getElementById('transactionInstructions');
        
        const stkPushSection = document.getElementById('stkPushSection');
        const transactionIdSection = document.getElementById('transactionIdSection');

        if (this.paymentMethod === 'stk') {
            if (stkInstructions) stkInstructions.classList.add('show');
            if (transactionInstructions) transactionInstructions.classList.remove('show');
            if (stkPushSection) stkPushSection.classList.add('show');
            if (transactionIdSection) transactionIdSection.classList.remove('show');
        } else {
            if (stkInstructions) stkInstructions.classList.remove('show');
            if (transactionInstructions) transactionInstructions.classList.add('show');
            if (stkPushSection) stkPushSection.classList.remove('show');
            if (transactionIdSection) transactionIdSection.classList.add('show');
        }

        this.validateForm();
    }

    setupTransactionIdValidation() {
        const transactionIdInput = document.getElementById('transactionId');
        const charCounter = document.getElementById('charCounter');

        if (transactionIdInput && charCounter) {
            transactionIdInput.addEventListener('input', (e) => {
                let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                e.target.value = value;
                
                const length = value.length;
                charCounter.textContent = `${length}/10`;
                
                // Update counter color based on length
                charCounter.className = 'char-counter';
                if (length === 10) {
                    charCounter.classList.add('success');
                    e.target.classList.add('success');
                    e.target.classList.remove('error');
                } else if (length >= 8) {
                    charCounter.classList.add('warning');
                } else if (length > 0) {
                    charCounter.classList.add('error');
                    e.target.classList.add('error');
                    e.target.classList.remove('success');
                } else {
                    e.target.classList.remove('success', 'error');
                }
                
                this.validateForm();
            });
        }
    }

    validateForm() {
        const requiredFields = ['fullName', 'phoneNumber', 'county', 'town', 'deliveryAddress'];
        let isValid = true;

        // Check required fields
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                isValid = false;
            }
        });

        // Phone number validation
        const phoneField = document.getElementById('phoneNumber');
        if (phoneField && phoneField.value) {
            const phoneDigits = phoneField.value.replace(/\D/g, '');
            if (phoneDigits.length !== 10 || !phoneDigits.startsWith('07')) {
                isValid = false;
            }
        }

        // Transaction ID validation for transaction method
        if (this.paymentMethod === 'transaction') {
            const transactionIdField = document.getElementById('transactionId');
            if (transactionIdField && !transactionIdField.value.trim()) {
                isValid = false;
            }
        }

        // Check if cart has items
        if (typeof cart === 'undefined' || !cart.items || cart.items.length === 0) {
            isValid = false;
        }

        // Update button states
        this.updatePaymentButtons(isValid);

        return isValid;
    }

    updatePaymentButtons(isValid) {
        const stkPayBtn = document.getElementById('stkPayBtn');
        const transactionPayBtn = document.getElementById('transactionPayBtn');

        if (stkPayBtn) {
            stkPayBtn.disabled = !isValid || this.isProcessing;
        }
        if (transactionPayBtn) {
            transactionPayBtn.disabled = !isValid || this.isProcessing;
        }
    }

    disablePaymentButtons() {
        const stkPayBtn = document.getElementById('stkPayBtn');
        const transactionPayBtn = document.getElementById('transactionPayBtn');

        if (stkPayBtn) stkPayBtn.disabled = true;
        if (transactionPayBtn) transactionPayBtn.disabled = true;
    }

    showError(title, message) {
        const errorElement = document.getElementById('paymentError');
        const errorTitle = document.getElementById('errorTitle');
        const errorDescription = document.getElementById('errorDescription');
        
        if (errorElement && errorTitle && errorDescription) {
            errorTitle.textContent = title;
            errorDescription.textContent = message;
            errorElement.classList.add('show');
            
            // Auto-hide error after 5 seconds
            setTimeout(() => {
                this.hideError();
            }, 5000);
        }
    }

    hideError() {
        const errorElement = document.getElementById('paymentError');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    showLoading(paymentMethod) {
        const stkLoading = document.getElementById('stkLoading');
        const transactionLoading = document.getElementById('transactionLoading');
        
        if (paymentMethod === 'stk' && stkLoading) {
            stkLoading.classList.add('show');
        } else if (transactionLoading) {
            transactionLoading.classList.add('show');
        }
    }

    hideLoading(paymentMethod) {
        const stkLoading = document.getElementById('stkLoading');
        const transactionLoading = document.getElementById('transactionLoading');
        
        if (paymentMethod === 'stk' && stkLoading) {
            stkLoading.classList.remove('show');
        } else if (transactionLoading) {
            transactionLoading.classList.remove('show');
        }
    }

    // Enhanced STK Payment Processing
    async processSTKPayment() {
        if (!this.validateForm()) {
            this.showError(
                'Form Incomplete', 
                'Please fill in all required fields correctly before proceeding with payment.'
            );
            return;
        }

        this.isProcessing = true;
        this.updatePaymentButtons(false);
        this.hideError();
        this.showLoading('stk');

        const stkPayBtn = document.getElementById('stkPayBtn');
        if (stkPayBtn) {
            stkPayBtn.textContent = 'Processing...';
        }

        try {
            const success = await this.simulateSTKPush();
            
            if (success) {
                await this.completeOrder('stk');
            } else {
                this.showError(
                    'STK Push Failed',
                    'The payment request was not completed. Please check your phone and try again, or use the Transaction ID method.'
                );
            }
        } catch (error) {
            console.error('STK Push error:', error);
            this.showError(
                'Payment Error',
                'We encountered an issue processing your payment. Please try again in a moment.'
            );
        } finally {
            this.isProcessing = false;
            this.hideLoading('stk');
            if (stkPayBtn) {
                stkPayBtn.textContent = `Pay with STK Push - ${document.getElementById('stkTotalAmount').textContent}`;
            }
            this.updatePaymentButtons(true);
        }
    }

    // Enhanced Transaction Payment Processing
    async processTransactionPayment() {
        if (!this.validateForm()) {
            this.showError(
                'Form Incomplete',
                'Please fill in all required fields correctly before verifying your payment.'
            );
            return;
        }

        const transactionId = document.getElementById('transactionId').value.trim();
        
        if (!transactionId) {
            this.showError(
                'Transaction ID Required',
                'Please enter your M-Pesa Transaction ID to verify your payment.'
            );
            return;
        }

        if (transactionId.length !== 10) {
            this.showError(
                'Invalid Transaction ID',
                'Please enter a valid 10-character Transaction ID from your M-Pesa confirmation message.'
            );
            return;
        }

        this.isProcessing = true;
        this.updatePaymentButtons(false);
        this.hideError();
        this.showLoading('transaction');

        const transactionPayBtn = document.getElementById('transactionPayBtn');
        if (transactionPayBtn) {
            transactionPayBtn.textContent = 'Verifying...';
        }

        try {
            const success = await this.simulateTransactionVerification(transactionId);
            
            if (success) {
                await this.completeOrder('transaction', transactionId);
            } else {
                this.showError(
                    'Verification Failed',
                    'The Transaction ID you entered could not be verified. Please check the ID and try again. Make sure you have sent the exact amount to +254 791 174063.'
                );
            }
        } catch (error) {
            console.error('Transaction verification error:', error);
            this.showError(
                'Verification Error',
                'We encountered an issue verifying your payment. Please try again in a moment.'
            );
        } finally {
            this.isProcessing = false;
            this.hideLoading('transaction');
            if (transactionPayBtn) {
                transactionPayBtn.textContent = `Verify Payment - ${document.getElementById('transactionTotalAmount').textContent}`;
            }
            this.updatePaymentButtons(true);
        }
    }

    // Enhanced simulation with better user experience
    async simulateSTKPush() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate 85% success rate for better testing
                const success = Math.random() > 0.15;
                console.log(success ? 'STK Push successful' : 'STK Push failed');
                resolve(success);
            }, 4000);
        });
    }

    async simulateTransactionVerification(transactionId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // More realistic validation
                const isValid = /^[A-Z0-9]{10}$/.test(transactionId);
                console.log(isValid ? 'Transaction ID valid' : 'Transaction ID invalid');
                resolve(isValid);
            }, 3000);
        });
    }

    // Complete Order Process
    async completeOrder(paymentMethod, transactionId = null) {
        console.log('Completing order with payment method:', paymentMethod);
        
        const orderData = {
            customer: this.getCustomerData(),
            payment: {
                method: paymentMethod,
                transactionId: transactionId,
                amount: cart.getTotal() + this.deliveryCost,
                status: 'completed'
            },
            items: cart.items,
            subtotal: cart.getTotal(),
            delivery: this.deliveryCost,
            total: cart.getTotal() + this.deliveryCost,
            orderNumber: this.generateOrderNumber(),
            orderDate: new Date().toISOString(),
            status: 'confirmed'
        };

        // Save order
        this.saveOrder(orderData);

        // Send WhatsApp notification
        this.sendWhatsAppNotification(orderData);

        // Clear cart
        cart.clearCart();

        // Show success page
        this.showOrderSuccess(orderData);
    }

    getCustomerData() {
        return {
            fullName: document.getElementById('fullName')?.value || '',
            phoneNumber: document.getElementById('phoneNumber')?.value.replace(/\s/g, '') || '',
            email: document.getElementById('email')?.value || '',
            county: document.getElementById('county')?.value || '',
            town: document.getElementById('town')?.value || '',
            deliveryAddress: document.getElementById('deliveryAddress')?.value || '',
            deliveryInstructions: document.getElementById('deliveryInstructions')?.value || ''
        };
    }

    saveOrder(orderData) {
        try {
            const orders = JSON.parse(localStorage.getItem('milan-orders') || '[]');
            orders.push(orderData);
            localStorage.setItem('milan-orders', JSON.stringify(orders));
            console.log('Order saved:', orderData.orderNumber);
        } catch (error) {
            console.error('Error saving order:', error);
        }
    }

    sendWhatsAppNotification(orderData) {
        const customer = orderData.customer;
        const message = `
🆕 *NEW ORDER - Milan Crochet*

*Order #:* ${orderData.orderNumber}
*Customer:* ${customer.fullName}
*Phone:* ${customer.phoneNumber}
*Amount:* ${this.formatPrice(orderData.total)}
*Payment:* ${orderData.payment.method.toUpperCase()} ${orderData.payment.transactionId ? `(${orderData.payment.transactionId})` : ''}

*Items:*
${orderData.items.map(item => `• ${item.product.name} (${item.quantity}x)`).join('\n')}

*Delivery:*
${customer.town}, ${customer.county}
${customer.deliveryAddress}
${customer.deliveryInstructions ? `Instructions: ${customer.deliveryInstructions}` : ''}
        `.trim();

        const whatsappUrl = `https://wa.me/254791174063?text=${encodeURIComponent(message)}`;
        
        // Open WhatsApp in new tab
        console.log('WhatsApp Notification:', message);
        window.open(whatsappUrl, '_blank');
    }

    showOrderSuccess(orderData) {
        const successHTML = `
            <div style="text-align: center; padding: 3rem 2rem;">
                <div style="background: #dcfce7; color: #059669; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                </div>
                <h2 style="color: #111827; margin-bottom: 1rem;">Order Confirmed! 🎉</h2>
                <p style="color: #6b7280; margin-bottom: 1rem;">
                    Thank you for your order! Your order number is <strong>${orderData.orderNumber}</strong>
                </p>
                
                <div style="background: #f8fafc; border-radius: 0.5rem; padding: 1.5rem; margin: 2rem 0; text-align: left;">
                    <h4 style="margin: 0 0 1rem 0; color: #111827;">What happens next?</h4>
                    <ul style="color: #6b7280; margin: 0; padding-left: 1.5rem;">
                        <li>We've received your payment via ${orderData.payment.method.toUpperCase()}</li>
                        <li>You'll receive an order confirmation via WhatsApp</li>
                        <li>We'll start working on your handmade items immediately</li>
                        <li>We'll notify you when your order is ready for delivery</li>
                    </ul>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">
                    <button onclick="navigateTo('index.html')" class="btn btn-secondary">
                        Continue Shopping
                    </button>
                    <button onclick="navigateTo('track-order.html')" class="btn btn-primary">
                        Track Your Order
                    </button>
                </div>
            </div>
        `;

        // Replace checkout content with success message
        const checkoutContainer = document.querySelector('.checkout-container');
        if (checkoutContainer) {
            checkoutContainer.innerHTML = successHTML;
        }
    }

    generateOrderNumber() {
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `MC${timestamp}${random}`;
    }
}

// Initialize checkout when page loads - FIXED VERSION
let checkout;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing checkout');
    
    // Wait a bit to ensure cart is initialized
    setTimeout(() => {
        checkout = new CheckoutManager();
        checkout.init(); // Now call init after constructor
        
        // Update cart count display
        if (cart) {
            cart.updateCartDisplay();
        }
        
        console.log('Checkout initialization complete');
    }, 100);
});

// Global navigation function
window.navigateTo = function(url) {
    window.location.href = url;
};

console.log('Checkout.js loaded successfully');