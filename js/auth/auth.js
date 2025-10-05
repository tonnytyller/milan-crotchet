// Main Authentication Manager
class AuthManager {
    constructor() {
        console.log('AuthManager initializing...');
        
        // Wait a bit for UserStore to be available
        setTimeout(() => {
            this.init();
        }, 100);
    }

    init() {
        console.log('AuthManager init started');
        
        // Safety check
        if (typeof UserStore === 'undefined') {
            console.error('UserStore not available');
            return;
        }
        
        // Initialize components
        this.userStore = new UserStore();
        this.socialAuth = new SocialAuth();
        this.session = new SessionManager();
        
        this.setupEventListeners();
        this.checkInitialAuth();
        
        console.log('AuthManager initialized successfully');
    }

    setupEventListeners() {
    console.log('Setting up auth event listeners');
    
    // Google login
    const googleBtn = document.getElementById('googleLogin');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => this.socialAuth.handleGoogleAuth());
    }

    // Instagram login
    const instagramBtn = document.getElementById('instagramLogin');
    if (instagramBtn) {
        instagramBtn.addEventListener('click', () => this.socialAuth.loginWithInstagram());
    }

    // Close login modal
    const closeBtn = document.getElementById('closeLogin');
    const overlay = document.getElementById('loginOverlay');
    const loginContent = document.querySelector('.login-content');

    if (closeBtn) closeBtn.addEventListener('click', () => this.hideLoginModal());
    if (overlay) overlay.addEventListener('click', () => this.hideLoginModal());

    // IMPORTANT: Prevent clicks inside modal from closing it
    if (loginContent) {
        loginContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.hideLoginModal();
    });
}

    checkInitialAuth() {
        if (this.userStore) {
            const user = this.userStore.getCurrentUser();
            if (user) {
                console.log('User already logged in:', user.name);
                this.session.updateUserInterface(user);
            } else {
                console.log('No user logged in');
            }
        }
    }

    // Show login modal
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            console.log('Login modal shown');
        }
    }

    // Hide login modal
    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            console.log('Login modal hidden');
        }
    }

    // Login success handler
    loginSuccess(user) {
        console.log('Login success for user:', user.name);
        
        // Save user to storage
        if (this.userStore) {
            this.userStore.setCurrentUser(user);
        }
        
        // Update UI
        this.session.updateUserInterface(user);
        
        // Hide login modal
        this.hideLoginModal();
        
        // Show welcome message
        this.showWelcomeToast(user);
    }

    // Logout
    logout() {
        console.log('Logging out user');
        this.session.logout();
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.userStore ? !!this.userStore.getCurrentUser() : false;
    }

    // Get current user
    getCurrentUser() {
        return this.userStore ? this.userStore.getCurrentUser() : null;
    }

    // Show welcome toast
    showWelcomeToast(user) {
        const toast = document.createElement('div');
        toast.className = 'welcome-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>Welcome back, ${user.name}!</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Global auth instance
let auth;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - starting auth system');
    auth = new AuthManager();
});

// Global function to show login modal
window.showLoginModal = function() {
    if (auth) {
        auth.showLoginModal();
    } else {
        console.log('Auth system not ready yet');
    }
};