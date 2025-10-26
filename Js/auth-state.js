// js/auth-state.js
class AuthStateManager {
    constructor() {
        this.supabase = null;
        this.authElements = null;
    }

    init(supabaseClient) {
        this.supabase = supabaseClient;
        this.setupAuthListener();
        this.updateAuthUI();
    }

    setupAuthListener() {
        // Listen for auth state changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session);
            this.updateAuthUI();
        });
    }

    async updateAuthUI() {
        const { data: { user } } = await this.supabase.auth.getUser();
        const authElements = document.querySelectorAll('[data-auth]');
        
        authElements.forEach(element => {
            if (user) {
                // User is logged in
                if (element.dataset.auth === 'authenticated') {
                    element.style.display = 'inline';
                    this.populateUserInfo(element, user);
                } else if (element.dataset.auth === 'unauthenticated') {
                    element.style.display = 'none';
                }
            } else {
                // User is not logged in
                if (element.dataset.auth === 'unauthenticated') {
                    element.style.display = 'inline';
                } else if (element.dataset.auth === 'authenticated') {
                    element.style.display = 'none';
                }
            }
        });
    }

    populateUserInfo(element, user) {
        const userInfo = element.querySelector('#user-info') || element;
        const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        
        userInfo.innerHTML = `
            <span style="color: #f97316; font-weight: 600;">Welcome, ${userName}</span>
        `;
    }

    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            // Force immediate UI update
            this.updateAuthUI();
            
            // Redirect to home page
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

// Global instance
const authStateManager = new AuthStateManager();