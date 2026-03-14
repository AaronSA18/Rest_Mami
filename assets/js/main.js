/**
 * Main JavaScript File
 * Burger & Broaster Express
 * 
 * Entry point - initializes all modules
 */

import { renderMenu } from './modules/carousel.js';
import { initCart } from './modules/cart.js';
import './modules/navigation.js';

/**
 * Initialize application
 */
function init() {
    console.log('🍔 Burger & Broaster Express - Initializing...');
    
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
