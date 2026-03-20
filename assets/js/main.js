/**
 * Main JavaScript File
 * Burger & Broaster Express
 * 
 * Entry point - initializes all modules
 */

import { renderMenu } from './modules/carousel.js';
import { initCart } from './modules/cart.js';
import './modules/navigation.js';

// Utility to break up long tasks (TBT Optimization)
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Initialize application
 */
async function init() {
    console.log('🍔 Burger & Broaster Express - Initializing...');

    // Yield main thread before huge loop calculations
    await yieldToMain();
    // Render menu items (async capable)
    const carousel = await import('./modules/carousel.js');
    await carousel.renderMenu();

    // Yield main thread before cart processing
    await yieldToMain();
    // Initialize cart
    const cart = await import('./modules/cart.js');
    cart.initCart();

    console.log('✅ Application initialized successfully!');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
