/*
 * BUSIAN frontend seed data.
 * This file is intentionally shaped like the future Supabase records.
 * Next stage: replace this read-only seed with Supabase queries.
 */
window.BUSIAN_DATA = {
  location: { name: "Busia", county: "Busia County", country: "Kenya" },

  categories: [
    { id: "supermarket", name: "Supermarket", short: "Everyday essentials", icon: "🛒", image: "Assets/1.jpg" },
    { id: "beauty", name: "Beauty & Care", short: "Personal care", icon: "✦", image: "Assets/Bodyshop.png" },
    { id: "electronics", name: "Electronics", short: "Phones & gadgets", icon: "▣", image: "Assets/1 (6).jpg" },
    { id: "fashion", name: "Fashion & Design", short: "Style & clothing", icon: "◇", image: "Assets/1 (5).jpg" },
    { id: "home", name: "Furniture & Home", short: "Home & office", icon: "⌂", image: "Assets/2.jpg" },
    { id: "phones", name: "Phones & Tablets", short: "Mobile devices", icon: "▯", image: "Assets/1 (4).jpg" },
    { id: "food", name: "Food & Restaurants", short: "Meals & menus", icon: "◉", image: "Assets/1 (7).jpg" },
    { id: "more", name: "More categories", short: "Explore BUSIAN", icon: "+", image: "Assets/1 (2).jpg" }
  ],

  merchants: [
    { id: "merchant-001", name: "Local Beauty Store", category: "Beauty & Care", location: "Busia Town", verified: true, products: 4 },
    { id: "merchant-002", name: "Local Electronics Store", category: "Electronics", location: "Busia Town", verified: true, products: 5 },
    { id: "merchant-003", name: "Local Supermarket", category: "Supermarket", location: "Busia Town", verified: true, products: 1 }
  ],

  products: [
    { id: "beauty-001", name: "Nivea Lotion", category: "Beauty", image: "Assets/1 (1).jpg", price: null, merchantId: "merchant-001", merchant: "Local Beauty Store", rating: 4.7, available: true },
    { id: "beauty-002", name: "Beauty Mask", category: "Beauty", image: "Assets/1 (3).jpg", price: null, merchantId: "merchant-001", merchant: "Local Beauty Store", rating: 4.6, available: true },
    { id: "beauty-003", name: "Beauty Product", category: "Beauty", image: "Assets/1 (5).jpg", price: null, merchantId: "merchant-001", merchant: "Local Beauty Store", rating: 4.5, available: true },
    { id: "beauty-004", name: "Bodyshop Product", category: "Beauty", image: "Assets/Bodyshop.png", price: null, merchantId: "merchant-001", merchant: "Local Beauty Store", rating: 4.7, available: true },
    { id: "electronics-001", name: "Hair Shaver", category: "Electronics", image: "Assets/1 (2).jpg", price: null, merchantId: "merchant-002", merchant: "Local Electronics Store", rating: 4.5, available: true },
    { id: "electronics-002", name: "Electronics Product", category: "Electronics", image: "Assets/1 (4).jpg", price: null, merchantId: "merchant-002", merchant: "Local Electronics Store", rating: 4.5, available: true },
    { id: "electronics-003", name: "Television", category: "Electronics", image: "Assets/1 (6).jpg", price: null, merchantId: "merchant-002", merchant: "Local Electronics Store", rating: 4.6, available: true },
    { id: "electronics-004", name: "Soundbar", category: "Electronics", image: "Assets/1 (7).jpg", price: null, merchantId: "merchant-002", merchant: "Local Electronics Store", rating: 4.6, available: true },
    { id: "electronics-005", name: "Television", category: "Electronics", image: "Assets/Televisons.png", price: null, merchantId: "merchant-002", merchant: "Local Electronics Store", rating: 4.6, available: true },
    { id: "supermarket-001", name: "Soko Maize Flour", category: "Supermarket", image: "Assets/1.jpg", price: null, merchantId: "merchant-003", merchant: "Local Supermarket", rating: 4.6, available: true }
  ]
};


      
