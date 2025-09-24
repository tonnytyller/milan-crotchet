// js/firebase.js - Firebase service functions

class FirebaseService {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
    }

    // User authentication (simple anonymous auth)
    async signInAnonymously() {
        try {
            const result = await this.auth.signInAnonymously();
            return result.user;
        } catch (error) {
            console.error('Anonymous sign-in failed:', error);
            // Fallback to generating a guest ID
            return { uid: 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9) };
        }
    }

    // Get current user ID (creates anonymous user if needed)
    async getUserId() {
        let user = this.auth.currentUser;
        if (!user) {
            user = await this.signInAnonymously();
        }
        return user ? user.uid : 'guest_' + Date.now();
    }

    // Submit a review
    async submitReview(productId, reviewData) {
        try {
            const userId = await this.getUserId();
            const review = {
                ...reviewData,
                productId,
                userId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                likes: 0,
                reported: false
            };

            const docRef = await this.db.collection('reviews').add(review);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error submitting review:', error);
            return { success: false, error: error.message };
        }
    }

    // Get reviews for a product
    async getReviews(productId) {
        try {
            const snapshot = await this.db
                .collection('reviews')
                .where('productId', '==', productId)
                .where('reported', '==', false)
                .orderBy('timestamp', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting reviews:', error);
            return [];
        }
    }

    // Real-time reviews listener
    subscribeToReviews(productId, callback) {
        return this.db
            .collection('reviews')
            .where('productId', '==', productId)
            .where('reported', '==', false)
            .orderBy('timestamp', 'desc')
            .onSnapshot(snapshot => {
                const reviews = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                callback(reviews);
            });
    }

    // Like a review
    async likeReview(reviewId) {
        try {
            const userId = await this.getUserId();
            await this.db.collection('reviewLikes').doc(`${reviewId}_${userId}`).set({
                reviewId,
                userId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Report a review
    async reportReview(reviewId, reason) {
        try {
            await this.db.collection('reports').add({
                reviewId,
                reason,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
const firebaseService = new FirebaseService();