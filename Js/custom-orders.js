// Custom orders page functionality

let selectedColors = [];
let uploadedImages = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeCustomOrdersPage();
});

function initializeCustomOrdersPage() {
    loadColorOptions();
    setupFileUpload();
    setupFormSubmission();
}

function loadColorOptions() {
    const colorGrid = document.getElementById('colorGrid');
    if (!colorGrid) return;
    
    colorGrid.innerHTML = availableColors.map(color => `
        <button type="button" class="color-btn" data-color="${color}" onclick="toggleColor('${color}')">
            ${color}
        </button>
    `).join('');
}

function toggleColor(color) {
    const colorBtn = document.querySelector(`[data-color="${color}"]`);
    if (!colorBtn) return;
    
    if (selectedColors.includes(color)) {
        selectedColors = selectedColors.filter(c => c !== color);
        colorBtn.classList.remove('active');
    } else {
        selectedColors.push(color);
        colorBtn.classList.add('active');
    }
}

function setupFileUpload() {
    const fileInput = document.getElementById('images');
    const fileUpload = document.getElementById('fileUpload');
    const imagePreviews = document.getElementById('imagePreviews');
    
    if (!fileInput || !fileUpload) return;
    
    // Click to upload
    fileUpload.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop
    fileUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUpload.style.borderColor = '#f97316';
    });
    
    fileUpload.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileUpload.style.borderColor = '#d1d5db';
    });
    
    fileUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUpload.style.borderColor = '#d1d5db';
        
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
        );
        
        handleFileSelection(files);
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFileSelection(files);
    });
}

function handleFileSelection(files) {
    // Limit to 5 images total
    const remainingSlots = 5 - uploadedImages.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    filesToAdd.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            showError(`File ${file.name} is too large. Maximum size is 5MB.`);
            return;
        }
        
        uploadedImages.push(file);
    });
    
    displayImagePreviews();
}

function displayImagePreviews() {
    const imagePreviews = document.getElementById('imagePreviews');
    if (!imagePreviews) return;
    
    imagePreviews.innerHTML = uploadedImages.map((file, index) => `
        <div class="image-preview">
            <img src="${URL.createObjectURL(file)}" alt="Preview ${index + 1}">
            <button type="button" class="remove-image" onclick="removeImage(${index})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `).join('');
}

function removeImage(index) {
    uploadedImages.splice(index, 1);
    displayImagePreviews();
}

function setupFormSubmission() {
    const orderForm = document.getElementById('orderForm');
    if (!orderForm) return;
    
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(this);
        const orderData = {
            customerName: formData.get('customerName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            description: formData.get('description'),
            preferredColors: selectedColors,
            preferredSize: formData.get('preferredSize'),
            urgency: formData.get('urgency'),
            deliveryAddress: formData.get('deliveryAddress'),
            referenceImages: uploadedImages.map(file => file.name),
            submittedAt: new Date().toISOString()
        };
        
        // Validate required fields
        if (!orderData.customerName || !orderData.email || !orderData.phone || 
            !orderData.description || !orderData.deliveryAddress) {
            showError('Please fill in all required fields.');
            return;
        }
        
        // Validate email
        if (!isValidEmail(orderData.email)) {
            showError('Please enter a valid email address.');
            return;
        }
        
        // Submit order
        submitCustomOrder(orderData);
    });
}

function submitCustomOrder(orderData) {
    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        Submitting...
    `;
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        console.log('Custom order submitted:', orderData);
        
        // Store order data (in a real app, this would be sent to a server)
        const orders = JSON.parse(localStorage.getItem('custom-orders') || '[]');
        orders.push({
            id: Date.now().toString(),
            ...orderData
        });
        localStorage.setItem('custom-orders', JSON.stringify(orders));
        
        // Show success message
        showSuccessMessage();
        
        // Reset form
        resetForm();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

function showSuccessMessage() {
    const customOrderForm = document.getElementById('customOrderForm');
    const successMessage = document.getElementById('successMessage');
    
    if (customOrderForm && successMessage) {
        customOrderForm.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function resetForm() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.reset();
    }
    
    // Reset selected colors
    selectedColors = [];
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Reset uploaded images
    uploadedImages = [];
    displayImagePreviews();
}

function showError(message) {
    // Create error toast
    const toast = document.createElement('div');
    toast.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        ">
            <div style="display: flex; align-items: flex-start; gap: 0.5rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <span style="font-size: 0.875rem; line-height: 1.4;">${message}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 4000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);