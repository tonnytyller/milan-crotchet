// Session Management
class SessionManager {
    constructor() {
        this.init();
    }

    init() {
        this.checkSession();
    }

    // Check if user has valid session
    checkSession() {
        // Use the global user store instance
        if (window.userStore) {
            const user = window.userStore.getCurrentUser();
            if (user) {
                this.updateUserInterface(user);
                return true;
            }
        }
        return false;
    }

    // Update UI based on login state
    updateUserInterface(user) {
        // Update header buttons
        const userBtn = document.getElementById('userBtn');
        const mobileUserBtn = document.getElementById('mobileUserBtn');
        
        if (userBtn) {
            userBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            `;
            userBtn.title = `Logged in as ${user.name}`;
        }

        if (mobileUserBtn) {
            mobileUserBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            `;
        }

        // Update user menu with profile info
        this.setupUserMenu(user);
    }

    // Setup user menu with profile info
    setupUserMenu(user) {
        const userMenu = document.querySelector('.user-menu-modal');
        if (userMenu) {
            const header = userMenu.querySelector('.user-menu-header');
            if (header) {
                const userInfo = header.querySelector('.user-info');
                if (userInfo) {
                    userInfo.innerHTML = `
                        <h3>${user.name || 'User'}</h3>
                        <p>${user.email || 'Connected with ' + user.provider}</p>
                    `;
                }
            }
        }
    }

    // Logout
    logout() {
        if (window.userStore) {
            window.userStore.setCurrentUser(null);
        }
        this.updateUserInterface(null);
        
        this.showLogoutToast();
        
        // Close any open modals
        if (window.auth) {
            window.auth.hideLoginModal();
        }
    }

    // Show logout confirmation
    showLogoutToast() {
        const toast = document.createElement('div');
        toast.className = 'logout-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16,17 21,12 16,7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>You have been logged out</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}