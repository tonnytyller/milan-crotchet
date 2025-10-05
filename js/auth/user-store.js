// User Data Storage
class UserStore {
    constructor() {
        this.storageKey = 'milan-users';
        this.currentUserKey = 'milan-current-user';
    }

    // Create new user
    createUser(userData) {
        const users = this.getAllUsers();
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const user = {
            id: userId,
            ...userData,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            orders: [],
            wishlist: [],
            loyaltyPoints: 0
        };
        
        users[userId] = user;
        this.saveAllUsers(users);
        
        console.log('User created:', user);
        return user;
    }

    // Find user by social ID
    findUserBySocialId(provider, socialId) {
        const users = this.getAllUsers();
        return Object.values(users).find(user => 
            user.provider === provider && user.socialId === socialId
        );
    }

    // Find user by email
    findUserByEmail(email) {
        const users = this.getAllUsers();
        return Object.values(users).find(user => user.email === email);
    }

    // Get current user
    getCurrentUser() {
        const userJson = localStorage.getItem(this.currentUserKey);
        return userJson ? JSON.parse(userJson) : null;
    }

    // Set current user
    setCurrentUser(user) {
        if (user) {
            localStorage.setItem(this.currentUserKey, JSON.stringify(user));
        } else {
            localStorage.removeItem(this.currentUserKey);
        }
    }

    // Get all users
    getAllUsers() {
        const usersJson = localStorage.getItem(this.storageKey);
        return usersJson ? JSON.parse(usersJson) : {};
    }

    // Save all users
    saveAllUsers(users) {
        localStorage.setItem(this.storageKey, JSON.stringify(users));
    }

    // Update user
    updateUser(userId, updates) {
        const users = this.getAllUsers();
        if (users[userId]) {
            users[userId] = { ...users[userId], ...updates };
            this.saveAllUsers(users);
            return users[userId];
        }
        return null;
    }
}

// Make available globally immediately
window.UserStore = UserStore;
console.log('UserStore loaded and available globally');