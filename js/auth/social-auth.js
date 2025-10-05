// Social Authentication Manager
class SocialAuth {
    constructor() {
        this.googleInitialized = false;
        this.instagramInitialized = false;
        this.initStyles();
    }

    initStyles() {
        // Only add styles if they don't exist
        if (!document.getElementById('auth-error-styles')) {
            const errorStyles = `
            .auth-error {
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 0.75rem 1rem;
                border-radius: 0.5rem;
                margin-bottom: 1rem;
                animation: slideDown 0.3s ease;
            }

            .error-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                font-weight: 500;
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            `;

            const styleSheet = document.createElement('style');
            styleSheet.id = 'auth-error-styles';
            styleSheet.textContent = errorStyles;
            document.head.appendChild(styleSheet);
        }
    }

    // Google Auth (Simulated for now)
    async handleGoogleAuth() {
        try {
            this.showLoading('google');
            
            // Simulate Google auth
            const userData = await this.simulateGoogleAuth();
            
            const milanUser = await this.createMilanUser({
                provider: 'google',
                userData: userData
            });
            
            if (window.auth) {
                window.auth.loginSuccess(milanUser);
            }
            
        } catch (error) {
            console.error('Google auth error:', error);
            this.showAuthError('Google login failed. Please try again.');
        } finally {
            this.hideLoading('google');
        }
    }

    // Instagram Auth (Simulated for now)
    async loginWithInstagram() {
        try {
            this.showLoading('instagram');
            
            const userData = await this.simulateInstagramAuth();
            
            const milanUser = await this.createMilanUser({
                provider: 'instagram',
                userData: userData
            });
            
            if (window.auth) {
                window.auth.loginSuccess(milanUser);
            }
            
        } catch (error) {
            console.error('Instagram auth error:', error);
            this.showAuthError('Instagram login failed. Please try again.');
        } finally {
            this.hideLoading('instagram');
        }
    }

    // Simulated Google Auth
    simulateGoogleAuth() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: 'google_' + Math.random().toString(36).substr(2, 9),
                    email: 'user' + Math.floor(Math.random() * 1000) + '@gmail.com',
                    name: 'Google User ' + Math.floor(Math.random() * 100),
                    picture: null,
                    verified: true
                });
            }, 1500);
        });
    }

    // Simulated Instagram Auth
    simulateInstagramAuth() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: 'instagram_' + Math.random().toString(36).substr(2, 9),
                    username: 'crochet_lover_' + Math.floor(Math.random() * 1000),
                    name: 'Instagram User',
                    profile_picture: null
                });
            }, 1500);
        });
    }

    // Create Milan User Account
async createMilanUser(authData) {
    // Use the auth manager's userStore
    if (!window.auth || !window.auth.userStore) {
        console.error('Auth system not ready');
        throw new Error('Auth system not ready');
    }
    
    let user = await window.auth.userStore.findUserBySocialId(authData.provider, authData.userData.id);
    
    if (!user) {
        // Create new user
        user = await window.auth.userStore.createUser({
            provider: authData.provider,
            socialId: authData.userData.id,
            email: authData.userData.email,
            name: authData.userData.name,
            avatar: authData.userData.picture || authData.userData.profile_picture,
            username: authData.userData.username
        });
    } else {
        // Update existing user
        user = await window.auth.userStore.updateUser(user.id, {
            lastLogin: new Date().toISOString()
        });
    }
    
    return user;
}

    // UI Helpers
    showLoading(provider) {
        const button = document.getElementById(provider + 'Login');
        if (button) {
            const originalText = button.querySelector('span').textContent;
            button.disabled = true;
            button.querySelector('span').textContent = 'Connecting...';
            button.style.opacity = '0.7';
        }
    }

    hideLoading(provider) {
        const button = document.getElementById(provider + 'Login');
        if (button) {
            button.disabled = false;
            const originalText = provider === 'google' ? 'Continue with Google' : 'Continue with Instagram';
            button.querySelector('span').textContent = originalText;
            button.style.opacity = '1';
        }
    }

    showAuthError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>${message}</span>
            </div>
        `;
        
        const loginBody = document.querySelector('.login-body');
        if (loginBody) {
            loginBody.insertBefore(errorDiv, loginBody.firstChild);
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }
}