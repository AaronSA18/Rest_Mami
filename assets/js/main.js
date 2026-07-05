/**
 * Main JavaScript File - Optimized
 * Burger & Broaster Express
 * 
 * Entry point - initializes all modules
 * Performance: Removed production console logs, optimized initialization
 */

import { renderMenu } from './modules/carousel.js';
import { initCart } from './modules/cart.js';
import { loadMenuData, loadMenuDataSync, shouldRefetchOnFocus } from './modules/menu-data.js';
import './modules/navigation.js';

// Production-safe logging
const isDev = import.meta.env.DEV;
const log = isDev ? console.log.bind(console) : () => {};
const warn = isDev ? console.warn.bind(console) : () => {};

/**
 * Initialize application
 */
async function init() {
    log('🍔 Burger & Broaster Express - Initializing...');

    // ── Phase 1: Instant render from cache (no await, no flash) ───────────────
    const cacheHit = loadMenuDataSync();
    if (cacheHit) {
        renderMenu({ immediate: true });
    }

    // ── Phase 2: Validate / refresh from Supabase ─────────────────────────────
    const dataLoaded = await loadMenuData();
    if (!dataLoaded) {
        warn('⚠️ Could not load menu data from Supabase. UI might be empty.');
    }

    // ── Phase 3: First-visit render (no cache was available) ──────────────────
    if (!cacheHit) {
        renderMenu();
    }

    // Initialize cart
    initCart();

    // ── refetchOnFocus ─────────────────────────────────────────────────────────
    document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState !== 'visible') return;
        if (!shouldRefetchOnFocus()) return;

        log('🔄 Tab refocused — refetching...');
        const refreshed = await loadMenuData({ forceRefresh: false });
        if (refreshed) renderMenu({ immediate: true });
    }, { passive: true });

    log('✅ Application initialized successfully!');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
