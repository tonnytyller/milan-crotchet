const mockProducts = [
    {
        id: '1',
        name: 'Milan Blue & White Striped Crochet Halter Top',
        description: 'A stylish hand-crocheted halter top featuring bold blue and white stripes, perfect for warm weather and casual outings.',
        price: 700,
        category: 'Women',
        images: ['images/1.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Blue & White'],
        inStock: true,
        featured: true,
        createdAt: '2024-01-01'
    },
    {
        id: '2',
        name: 'Milan Black Crochet Openwork Sweater',
        description: 'A stylish black crochet sweater featuring an openwork pattern, perfect for layering and adding texture to any outfit.',
        price: 600,
        category: 'Women',
        images: ['images/2.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Black'],
        inStock: true,
        featured: false,
        createdAt: '2024-01-02'
    },
    {
        id: '3',
        name: 'Milan Beige Crochet Ruffled Hat',
        description: 'A charming beige crochet hat with elegant ruffled edges, combining both style and comfort for a unique handmade accessory.',
        price: 350,
        category: 'Hats & Bennies',
        images: ['images/3.jpg'],
        sizes: ['One Size'],
        colors: ['Beige'],
        inStock: true,
        featured: false,
        createdAt: '2024-01-03'
    },
    {
        id: '4',
        name: 'Mipqn Black Crochet Crop Top with Yellow Accent',
        description: 'Stylish black crochet long-sleeve crop top featuring a bright yellow tie and neckline accent, perfect for adding a pop of color to your outfit.',
        price: 450,
        category: 'Women',
        images: ['images/4.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Black & Yellow'],
        inStock: true,
        featured: false,
        createdAt: '2024-01-04'
    },
    {
        id: '5',
        name: 'Mioan Black and Burgundy Crochet Cardigan',
        description: 'A stylish handmade crochet cardigan featuring a striking black and burgundy color combination, perfect for layering with a cozy, artisanal touch.',
        price: 650,
        category: 'Men',
        images: ['images/5.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Black & Burgundy'],
        inStock: true,
        featured: false,
        createdAt: '2024-01-05'
    },
    {
        id: '6',
        name: 'Mipan Yin & Yang Beanie',
        description: 'A cozy blend of contrast and balance, this hand-crocheted beanie features bold black and white halves — perfect for adding a touch of harmony to your winter style.',
        price: 600,
        category: 'Hats & Bennies',
        images: ['images/6.jpg'],
        sizes: ['S','L'],
        colors: ['Black','White'],
        inStock: true,
        featured: false,
        createdAt: '2025-01-05'
    },
    {
        id: '7',
        name: 'Milan Green Breeze Crochet Top',
        description: 'A stunning handmade long-sleeve crochet crop top in vibrant violet. Designed with an airy, open-stitch pattern for comfort and breathability, this top is perfect for casual wear or layering. Made from soft acrylic yarn with a snug fit that flatters the body.',
        price: 550,
        category: 'Women',
        images: ['images/7.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Violet'],
        inStock: true,
        featured: false,
        createdAt: '2024-01-07'
    },
    {
        id: '8',
        name: 'Milan Green & White Striped Crochet Two-Piece Set',
        description: 'A stylish, handmade crochet outfit featuring a strapless bandeau top and a matching high-waisted mini skirt. Designed with alternating green and white horizontal stripes, this set offers a chic and breathable look, perfect for summer outings or beachwear.',
        price: 1200,
        category: 'Women',
        images: ['images/8.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Green & White'],
        inStock: true,
        featured: true,
        createdAt: '2024-01-08'
    },
    {
        id: '9',
        name: 'Milan Hot Pink Crochet Tube & Skirt Set',
        description: 'A bold and stylish two-piece crochet outfit featuring a strapless tube top with a front bow tie and a matching high-waisted mini skirt. Perfect for summer outings or beach parties.',
        price: 1300,
        category: 'Women',
        images: ['images/9.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Pink'],
        inStock: true,
        featured: true,
        createdAt: '2024-01-09'
    },
    {
        id: '10',
        name: 'Milan Beige Crochet Ruffled Hat',
        description: 'A charming crochet hat with delicate ruffled edges, perfect for sun protection with a stylish twist.',
        price: 450,
        category: 'Hats & Bennies',
        images: ['images/10.jpg'],
        sizes: ['One Size'],
        colors: ['Beige','white'],
        inStock: true,
        featured: false,
        createdAt: '2024-01-10'
    },
    {
        id: '11',
        name: 'Milan Purple Crochet Crop Top',
        description: 'A vibrant purple crochet long-s sleeve crop top that blends comfort with fashion, ideal for casual wear.',
        price: 750,
        category: 'Women',
        images: ['images/11.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Purple'],
        inStock: true,
        featured: true,
        createdAt: '2024-01-11'
    },
    {
        id: '12',
        name: 'Milan Multicolor Crochet Basket Bag',
        description: 'A handcrafted basket-style crochet bag featuring a mix of earthy tones, perfect for a boho chic look.',
        price: 800,
        category: 'Bags',
        images: ['images/12.jpg'],
        sizes: ['One Size'],
        colors: ['Multicolor'],
        inStock: true,
        featured: false,
        createdAt: '2024-01-12'
    },
    {
        id: '13',
        name: 'Milan Yellow Crochet Shorts',
        description: 'Bright and playful yellow crochet shorts, comfortable and perfect for warm weather.',
        price: 300,
        category: 'Women',
        images: ['images/13.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Yellow'],
        inStock: true,
        featured: false,
        createdAt: '2024-01-13'
    },
    {
        id: '14',
        name: 'Milan Purple Crochet Crop Top and Skirt Set',
        description: 'A cozy and trendy blue crochet crop top paired with a matching high-waisted skirt, great for casual and beach vibes.',
        price: 1100,
        category: 'Women',
        images: ['images/14.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Blue'],
        inStock: true,
        featured: false,
        createdAt: '2024-01-14'
    },
    {
        id: '15',
        name: 'Milan White Crochet Dress',
        description: 'An elegant and delicate white crochet dress with intricate detailing, perfect for summer events.',
        price: 700,
        category: 'Women',
        images: ['images/15.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['White'],
        inStock: true,
        featured: false,
        createdAt: '2024-01-15'
    },
    {
        id: '16',
        name: 'Milan Brown Crochet Vest',
        description: 'A stylish and versatile brown crochet vest that can be layered over various outfits for added texture.',
        price: 650,
        category: 'Men',
        images: ['images/16.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Brown'],
        inStock: true,
        featured: false,
        createdAt: '2024-01-16'
    },
    {
        id: '17',
        name: 'Milan Crochet Halter bennies',
        description: 'A vibrant crochet halter bennies with a bohemian flair, perfect for nights out and casual wear.',
        price: 600,
        category: 'Hats & Bennies',
        images: ['images/17.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Orange','gray','Brown'],
        inStock: true,
        featured: false,
        createdAt: '2024-01-17'
    },{
        id: '18',
        name: 'Milan Sandy Breeze Set',
        description: ' A chic beige crochet two-piece set featuring a halter bralette and a mesh-style maxi skirt — perfect for beach getaways or warm evening strolls. Light, breathable, and effortlessly elegant.',
        price: 1800,
        category: 'Women',
        images: ['images/18.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['white','purple'],
        inStock: true,
        featured: false,
        createdAt: '2025-04-02'
    },
    {
        id: '19',
        name: 'Milan Coconut Crush Set',
        description: 'A flirty white crochet mini skirt and matching crop top set with a halter neckline — playful, breathable, and perfect for sunny days or beachside vibes.',
        price: 1600,
        category: 'Women',
        images: ['images/19.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['white','purple'],
        inStock: true,
        featured: false,
        createdAt: '2025-06-01'
    },
    {
        id: '20',
        name: 'Milan Midnight Muse Set',
        description: 'Elegant and bold, this black crochet two-piece set features a corset-style top and a matching semi-sheer skirt — perfect for evening outings or a confident, statement look.',
        price: 2100,
        category: 'Women',
        images: ['images/20.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['black','white'],
        inStock: true,
        featured: false,
        createdAt: '2025-06-01'
    },
    {
        id: '21',
        name: 'Milan Olive Glow Maxi Skirt',
        description: 'A stunning hand-crocheted olive green maxi skirt that hugs the curves perfectly — ideal for a bold, earthy statement with casual or elevated looks.',
        price: 550,
        category: 'Women',
        images: ['images/21.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['green'],
        inStock: true,
        featured: false,
        createdAt: '2025-06-01'
    },
    {
        id: '22',
        name: 'Milan Sunshine Blossom Top',
        description: 'A white crochet halter top with a playful open-stitch pattern, perfect for sunny days and outdoor vibes. Styled with colorful beads and a red bow, it radiates youthful charm and energy.',
        price: 550,
        category: 'Women',
        images: ['images/22.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['white','black'],
        inStock: true,
        featured: false,
        createdAt: '2025-04-02'
    },
    {
        id: '23',
        name: 'Milan Ruby Mesh Statement Skirt',
        description: 'Bold and daring, this vibrant red crochet skirt features mesh panels and delicate pearl accents — perfect for turning heads and making every step unforgettable.',
        price: 1200,
        category: 'Men',
        images: ['images/23.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['red','white'],
        inStock: true,
        featured: false,
        createdAt: '2024-01-17'
    },
    {
        id: '24',
        name: 'Milan Mesh Button-Up ',
        description: 'A stylish, handcrafted crochet button-up shirt featuring a breathable open-weave mesh design. Made with soft beige yarn, it blends comfort and sophistication — perfect for warm-weather fashion or layered urban looks. Ideal for the modern man who appreciates bold yet refined crochet wear.',
        price: 850,
        category: 'Men',
        images: ['images/24.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [''],
        inStock: true,
        featured: false,
        createdAt: ''
    },
];

const categories = [
    'All',
    'Women',
    'Bags',
    'Accessories',
    'Blankets',
    'Hats & Bennies',
    'Children',
    'Men'
];

const availableColors = [
    'Red', 'Pink', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Brown', 'Black', 'White', 'Gray', 'Beige','Multicolor'
];

// Utility functions
function formatPrice(price) {
    return `KSh ${price.toLocaleString()}`;
}

function getCommentCount(productId) {
    return productComments[productId] ? productComments[productId].length : 0;
}

function getColorStyle(color) {
    const colorMap = {
        'pink': '#ec4899',
        'blue': '#3b82f6',
        'green': '#10b981',
        'yellow': '#f59e0b',
        'white': '#ffffff',
        'purple': '#8b5cf6',
        'red': '#ef4444',
        'orange': '#f97316',
        'brown': '#a3a3a3',
        'black': '#111827',
        'gray': '#6b7280',
        'beige': '#d4b896'
    };
    
    const colorKey = color.toLowerCase().split(' ')[0];
    return colorMap[colorKey] || '#6b7280';
}

function getProductById(id) {
    return mockProducts.find(product => product.id === id);
}

function getFeaturedProducts() {
    return mockProducts.filter(product => product.featured);
}

function filterProducts(searchTerm = '', category = 'All') {
    return mockProducts.filter(product => {
        const matchesCategory = category === 'All' || product.category === category;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });
}

function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch (sortBy) {
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'featured':
        default:
            return sorted.sort((a, b) => b.featured ? 1 : -1);
    }
}