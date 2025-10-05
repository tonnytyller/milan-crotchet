// WhatsApp integration for orders
class WhatsAppManager {
    constructor() {
        this.businessPhone = '254791174063';
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    openCheckoutModal(items, total) {
        // Create and show checkout modal
        const modal = this.createCheckoutModal(items, total);
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);

        // Setup form submission
        const form = modal.querySelector('#checkout-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processOrder(items, total, form);
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });

        // Close modal
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
    }

    createCheckoutModal(items, total) {
        const modal = document.createElement('div');
        modal.className = 'checkout-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Complete Your Order</h3>
                    <button class="close-modal">✕</button>
                </div>
                <form id="checkout-form">
                    <div class="form-group">
                        <label for="customer-name">Full Name *</label>
                        <input type="text" id="customer-name" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="customer-phone">Phone Number *</label>
                        <input type="tel" id="customer-phone" name="phone" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="customer-location">Delivery Location *</label>
                        <select id="customer-location" name="location" required>
                            <option value="">Select your area</option>
                            <option value="Ngong Town">Ngong Town - Free Delivery</option>
                            <option value="Matasia">Matasia - Free Delivery</option>
                            <option value="Kiserian">Kiserian - KSh 150</option>
                            <option value="Ongata Rongai">Ongata Rongai - KSh 150</option>
                            <option value="Nairobi CBD">Nairobi CBD - KSh 300</option>
                            <option value="Other">Other Areas - Contact for Pricing</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="customer-address">Detailed Address</label>
                        <textarea id="customer-address" name="address" rows="3" placeholder="House number, street, landmarks..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="special-notes">Special Instructions</label>
                        <textarea id="special-notes" name="notes" rows="3" placeholder="Any special requests or notes..."></textarea>
                    </div>
                    
                    <div class="order-summary">
                        <h4>Order Summary</h4>
                        ${items.map(item => `
                            <div class="order-item">
                                <span>${item.name} × ${item.quantity}</span>
                                <span>KSh ${(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        `).join('')}
                        <div class="order-total">
                            <strong>Total: KSh ${total.toLocaleString()}</strong>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block">
                        Complete Order via WhatsApp
                    </button>
                </form>
            </div>
        `;
        
        return modal;
    }

    processOrder(items, total, form) {
        const formData = new FormData(form);
        const orderData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            location: formData.get('location'),
            address: formData.get('address'),
            notes: formData.get('notes'),
            items: items,
            total: total,
            orderNumber: this.generateOrderNumber(),
            orderDate: new Date().toLocaleDateString('en-KE')
        };

        const message = this.formatOrderMessage(orderData);
        this.sendWhatsAppMessage(message);
        
        // Clear cart after successful order
        window.cartManager.clearCart();
    }

    formatOrderMessage(orderData) {
        let message = `🎀 MILAN CROCHET ORDER\n\n`;
        message += `Order #: ${orderData.orderNumber}\n`;
        message += `Customer: ${orderData.name}\n`;
        message += `Phone: ${orderData.phone}\n`;
        message += `Location: ${orderData.location}\n`;
        
        if (orderData.address) {
            message += `Address: ${orderData.address}\n`;
        }
        
        message += `\n📦 ORDER ITEMS:\n`;
        orderData.items.forEach(item => {
            message += `• ${item.name}`;
            if (item.color) message += ` - ${item.color}`;
            if (item.size) message += ` - ${item.size}`;
            message += ` ×${item.quantity} - KSh ${(item.price * item.quantity).toLocaleString()}\n`;
        });
        
        message += `\n💰 TOTAL: KSh ${orderData.total.toLocaleString()}\n`;
        
        if (orderData.notes) {
            message += `\n📝 SPECIAL NOTES:\n${orderData.notes}\n`;
        }
        
        message += `\n🕒 Order Date: ${orderData.orderDate}\n`;
        message += `\nPlease confirm this order and provide M-Pesa payment details!`;
        
        return encodeURIComponent(message);
    }

    generateOrderNumber() {
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `MC-${timestamp}${random}`;
    }

    sendWhatsAppMessage(message) {
        const url = `https://wa.me/${this.businessPhone}?text=${message}`;
        window.open(url, '_blank');
    }

    setupEventListeners() {
        // Direct WhatsApp contact buttons
        const whatsappButtons = document.querySelectorAll('.btn-whatsapp');
        whatsappButtons.forEach(button => {
            if (!button.closest('.cta-actions')) { // Exclude CTA buttons that already have href
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const defaultMessage = encodeURIComponent("Hello! I'm interested in Milan Crochet products. Can you help me?");
                    const url = `https://wa.me/${this.businessPhone}?text=${defaultMessage}`;
                    window.open(url, '_blank');
                });
            }
        });
    }
}

// Initialize WhatsApp manager
window.whatsappManager = new WhatsAppManager();