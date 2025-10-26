// js/test-products.js - Simple test to see if ProductsService loads
console.log('🧪 Test ProductsService loading...');

// Test if ProductsService exists
if (typeof ProductsService === 'undefined') {
    console.log('❌ ProductsService is NOT defined');
} else {
    console.log('✅ ProductsService IS defined');
}

// Test if we can call the method
if (typeof ProductsService !== 'undefined') {
    console.log('🔄 Testing ProductsService.getFeaturedProducts...');
    ProductsService.getFeaturedProducts().then(products => {
        console.log('✅ ProductsService test result:', products);
    }).catch(error => {
        console.error('❌ ProductsService test error:', error);
    });
}