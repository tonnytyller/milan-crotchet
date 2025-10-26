// Admin Authentication & Session Management
console.log('🔐 Loading admin authentication...');

// Check if user is logged in as admin
function checkAdminSession() {
    console.log('🔄 Checking admin session...');
    
    const adminToken = localStorage.getItem('admin_token');
    
    if (!adminToken) {
        console.log('❌ No admin session found, redirecting to login...');
        window.location.href = 'index.html';
        return null;
    }

    try {
        const session = JSON.parse(adminToken);
        
        // Check if session is still valid (less than 24 hours old)
        const loginTime = new Date(session.loginTime);
        const currentTime = new Date();
        const hoursDiff = (currentTime - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            console.log('❌ Session expired, redirecting to login...');
            localStorage.removeItem('admin_token');
            window.location.href = 'index.html';
            return null;
        }

        console.log('✅ Valid admin session found for:', session.name);
        return session;
        
    } catch (error) {
        console.error('❌ Error parsing admin token:', error);
        localStorage.removeItem('admin_token');
        window.location.href = 'index.html';
        return null;
    }
}

// Initialize admin session when page loads
function initializeAdminSession() {
    console.log('🚀 Initializing admin session...');
    
    const session = checkAdminSession();
    
    if (session) {
        // Update welcome message with admin name
        const adminNameElement = document.getElementById('adminName');
        if (adminNameElement) {
            adminNameElement.textContent = session.name;
        }
        
        // Set up logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        console.log('✅ Admin session initialized successfully');
        return true;
    }
    
    return false;
}

// Handle logout
function handleLogout() {
    console.log('👋 Admin logging out...');
    
    // Clear admin session
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_last_login');
    
    // Redirect to login page
    window.location.href = 'index.html';
}

// Add session check when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Admin page loaded, checking session...');
    initializeAdminSession();
});

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkAdminSession, initializeAdminSession, handleLogout };
}