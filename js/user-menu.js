// user-menu.js - UPDATED VERSION with login integration
const UserMenu = {
    isOpen: false,
    
    init: function() {
        console.log('UserMenu initialized');
        
        // Desktop user button
        const userBtn = document.getElementById('userBtn');
        if (userBtn) {
            userBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleUserButtonClick();
            });
        }
        
        // Mobile user button
        const mobileUserBtn = document.getElementById('mobileUserBtn');
        if (mobileUserBtn) {
            mobileUserBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleUserButtonClick();
            });
        }
    },
    
    handleUserButtonClick: function() {
        // Check if user is logged in using the auth system
        if (window.auth && window.auth.isLoggedIn()) {
            // User is logged in - show user menu
            this.toggleUserMenu();
        } else {
            // User not logged in - show login modal
            this.showLoginModal();
        }
    },
    
    toggleUserMenu: function() {
        if (this.isOpen) {
            this.hideUserMenu();
        } else {
            this.showUserMenu();
        }
    },
    
    showUserMenu: function() {
        // Remove existing if any
        this.hideUserMenu();
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'userMenuModal';
        modal.className = 'user-menu-modal';
        modal.innerHTML = this.getUserMenuHTML();
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'userMenuOverlay';
        overlay.className = 'user-menu-overlay';
        
        // Add to DOM
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
        
        // Add event listeners
        overlay.addEventListener('click', () => this.hideUserMenu());
        document.getElementById('closeUserMenu').addEventListener('click', () => this.hideUserMenu());
        
        // Show with animation
        setTimeout(() => {
            modal.classList.add('open');
            overlay.classList.add('show');
        }, 10);
        
        this.isOpen = true;
    },

    hideUserMenu: function() {
        const modal = document.getElementById('userMenuModal');
        const overlay = document.getElementById('userMenuOverlay');
        
        if (modal) {
            modal.classList.remove('open');
            setTimeout(() => modal.remove(), 300);
        }
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
        
        this.isOpen = false;
    },
    
    getUserMenuHTML: function() {
        // Get user info if available
        const currentUser = window.auth ? window.auth.getCurrentUser() : null;
        const userName = currentUser ? currentUser.name : 'Guest User';
        const userInitial = currentUser ? currentUser.name.charAt(0).toUpperCase() : 'U';
        const userStatus = currentUser ? 'Manage your account' : 'Login to access your account';
        
        return `
            <div class="user-menu-content">
                <div class="user-menu-header">
                    <div class="user-menu-header-info">
                        <div class="user-avatar">${userInitial}</div>
                        <div class="user-info">
                            <h3>${userName}</h3>
                            <p>${userStatus}</p>
                        </div>
                    </div>
                    <button id="closeUserMenu" class="close-user-menu">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                <div class="user-menu-items">
                    ${currentUser ? `
                        <a href="profile.html" class="user-menu-item" onclick="UserMenu.hideUserMenu()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            View Profile
                        </a>

                        <a href="orders.html" class="user-menu-item" onclick="UserMenu.hideUserMenu()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14,2 14,8 20,8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10,9 9,9 8,9"></polyline>
                            </svg>
                            My Orders
                        </a>

                        <a href="track-order.html" class="user-menu-item" onclick="UserMenu.hideUserMenu()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                <circle cx="12" cy="11" r="3"></circle>
                            </svg>
                            Track Order
                        </a>

                        <button class="user-menu-item logout-btn" onclick="UserMenu.handleLogout()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16,17 21,12 16,7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Logout
                        </button>
                    ` : `
                        <button class="user-menu-item" onclick="UserMenu.showLoginModal()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                <polyline points="10,17 15,12 10,7"></polyline>
                                <line x1="15" y1="12" x2="3" y2="12"></line>
                            </svg>
                            Login / Sign Up
                        </button>
                    `}
                </div>
            </div>
        `;
    },
    
    showLoginModal: function() {
        // Use the existing login modal from main.js
        if (window.showLoginModal) {
            window.showLoginModal();
        } else {
            // Fallback: Show the login modal directly
            const loginModal = document.getElementById('loginModal');
            const loginOverlay = document.getElementById('loginOverlay');
            
            if (loginModal && loginOverlay) {
                loginModal.classList.add('show');
                document.body.style.overflow = 'hidden';
                
                // Add close handlers
                const closeLogin = document.getElementById('closeLogin');
                if (closeLogin) {
                    closeLogin.addEventListener('click', () => this.hideLoginModal());
                }
                if (loginOverlay) {
                    loginOverlay.addEventListener('click', () => this.hideLoginModal());
                }
            }
        }
    },
    
    hideLoginModal: function() {
        const loginModal = document.getElementById('loginModal');
        const loginOverlay = document.getElementById('loginOverlay');
        
        if (loginModal) {
            loginModal.classList.remove('show');
        }
        document.body.style.overflow = '';
    },
    
    handleLogout: function() {
        console.log('Logout clicked');
        if (window.auth) {
            window.auth.logout();
        }
        this.hideUserMenu();
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    UserMenu.init();
});

window.UserMenu = UserMenu;