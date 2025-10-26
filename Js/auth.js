// js/auth.js - COMPLETE AUTHENTICATION SYSTEM (NON-MODULE VERSION)
console.log('🔐 Loading AuthManager...');

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    async init() {
        if (!window.supabase) {
            console.error('❌ Supabase not available for auth');
            return;
        }

        try {
            // Check for existing session
            const { data: { session } } = await window.supabase.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                console.log('✅ User already signed in:', session.user.email);
                this.updateAuthUI();
            }
            
            // Listen for auth changes
            window.supabase.auth.onAuthStateChange((event, session) => {
                console.log('🔐 Auth state changed:', event);
                if (event === 'SIGNED_IN' && session) {
                    this.currentUser = session.user;
                    console.log('🔐 User signed in:', session.user.email);
                    this.onSignInSuccess();
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    console.log('🚪 User signed out');
                    this.onSignOut();
                }
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
        }
    }
    
    // Email & Password Registration
    async register(email, password, userData) {
        try {
            if (!window.supabase) {
                throw new Error('Supabase not available');
            }

            const { data, error } = await window.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: userData.fullName,
                        phone: userData.phone,
                        username: userData.username
                    }
                }
            });
            
            if (error) throw error;
            
            // Create user profile
            if (data.user) {
                await this.createUserProfile(data.user.id, userData);
            }
            
            return { success: true, user: data.user };
            
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Email & Password Login
    async login(email, password) {
        try {
            if (!window.supabase) {
                throw new Error('Supabase not available');
            }

            const { data, error } = await window.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) throw error;
            
            return { success: true, user: data.user };
            
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Logout
    async logout() {
        if (!window.supabase) {
            console.error('Supabase not available for logout');
            return false;
        }

        const { error } = await window.supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
            return false;
        }
        return true;
    }
    
    // Create user profile in database
    async createUserProfile(userId, userData) {
        if (!window.supabase) {
            console.error('Supabase not available for profile creation');
            return;
        }

        const { error } = await window.supabase
            .from('profiles')
            .insert({
                id: userId,
                username: userData.username,
                full_name: userData.fullName,
                phone: userData.phone,
                role: 'customer'
            });
            
        if (error) {
            console.error('Error creating profile:', error);
        }
    }
    
    // Get current user with profile
    async getCurrentUser() {
        if (!this.currentUser || !window.supabase) return null;
        
        try {
            const { data: profile } = await window.supabase
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();
                
            return { ...this.currentUser, profile };
        } catch (error) {
            console.error('Error getting user profile:', error);
            return this.currentUser;
        }
    }
    
    // Check if user is admin
    async isAdmin() {
        const user = await this.getCurrentUser();
        return user?.profile?.role === 'admin';
    }
    
    // Password reset
    async resetPassword(email) {
        if (!window.supabase) {
            console.error('Supabase not available for password reset');
            return false;
        }

        const { error } = await window.supabase.auth.resetPasswordForEmail(email);
        return !error;
    }
    
    // Callback when user signs in successfully
    onSignInSuccess() {
        console.log('✅ Sign in success callback');
        
        // Show success message
        this.showNotification('Welcome back!', 'success');
        
        // Update UI
        this.updateAuthUI();
        
        // Redirect or update page
        if (window.location.pathname.includes('login.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }
    
    // Callback when user signs out
    onSignOut() {
        console.log('✅ Sign out callback');
        this.showNotification('Signed out successfully', 'info');
        this.updateAuthUI();
        
        // Redirect to home if on profile page
        if (window.location.pathname.includes('profile.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }
    
    // Update UI based on auth state
    updateAuthUI() {
        console.log('🔄 Updating auth UI, user:', this.currentUser?.email);
        
        const authElements = document.querySelectorAll('[data-auth]');
        
        authElements.forEach(element => {
            const authState = element.getAttribute('data-auth');
            
            if (authState === 'authenticated') {
                element.style.display = this.currentUser ? 'inline' : 'none';
            } else if (authState === 'unauthenticated') {
                element.style.display = this.currentUser ? 'none' : 'inline';
            }
        });
        
        // Update user info in header
        const userInfoElement = document.getElementById('user-info');
        if (userInfoElement) {
            if (this.currentUser) {
                userInfoElement.textContent = `Welcome, ${this.currentUser.email}`;
                userInfoElement.style.display = 'inline';
            } else {
                userInfoElement.style.display = 'none';
            }
        }
    }
    
    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.auth-notification');
        existingNotifications.forEach(note => note.remove());
        
        const notification = document.createElement('div');
        notification.className = `auth-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#059669' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Create global instance
window.authManager = new AuthManager();
console.log('✅ AuthManager initialized');