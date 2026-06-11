/**
 * Main JavaScript File
 * Burger & Broaster Express
 * 
 * Entry point - initializes all modules
 */

import { renderMenu } from './modules/carousel.js';
import { initCart } from './modules/cart.js';
import { loadMenuData } from './modules/menu-data.js';
import './modules/navigation.js';

/**
 * Initialize application
 */
async function init() {
    console.log('🍔 Burger & Broaster Express - Initializing...');

    // Load data from Supabase
    const dataLoaded = await loadMenuData();
    if (!dataLoaded) {
        console.warn('⚠️ Could not load menu data from Supabase. UI might be empty.');
    }

    // Render menu items
    renderMenu();

    // Initialize cart
    initCart();

    console.log('✅ Application initialized successfully!');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
