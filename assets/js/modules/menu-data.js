/**
 * Menu Data Module - Optimized
 * Burger & Broaster Express
 * 
 * Fetches menu items from Supabase and organizes them by category.
 * Uses localStorage cache with per-type staleTime to reduce unnecessary
 * backend requests.
 * Performance: Production-safe logging, optimized cache operations
 */

import { getSupabase, SUPABASE_URL } from './supabase.js';

// Production-safe logging
const isDev = import.meta.env.DEV;
const log = isDev ? console.log.bind(console) : () => {};
const warn = isDev ? console.warn.bind(console) : () => {};
const error = isDev ? console.error.bind(console) : () => {};

export let menuData = {
    broaster: [],
    burgers: [],
    salchipapas: [],
    drinks: [],
    combos: []
};

// Map database category names to our UI keys if they differ
const categoryNameMap = {
    'broaster': 'broaster',
    'hamburguesas': 'burgers',
    'burgers': 'burgers',
    'salchipapas': 'salchipapas',
    'bebidas': 'drinks',
    'drinks': 'drinks'
};

// ─── Cache configuration ─────────────────────────────────────────────────────
// staleTime: ms before the cached value is considered outdated
// refetchOnFocus: whether to silently re-check when the user returns to the tab
const CACHE_CONFIG = {
    categories: { key: 'cache_bex_categories', staleTime: 24 * 60 * 60 * 1000, refetchOnFocus: false }, // 24 h
    products:   { key: 'cache_bex_products',   staleTime: 30 * 60 * 1000,       refetchOnFocus: true  }, // 30 min
    combos:     { key: 'cache_bex_combos',     staleTime: 30 * 60 * 1000,       refetchOnFocus: true  }, // 30 min
};

// ─── Cache helpers ────────────────────────────────────────────────────────────
function readCache(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw); // { data, timestamp }
    } catch {
        return null;
    }
}

function writeCache(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) {
        warn('Cache write failed (storage full?):', e);
    }
}

function isCacheStale(cached, staleTime) {
    if (!cached || typeof cached.timestamp !== 'number') return true;
    return Date.now() - cached.timestamp > staleTime;
}

// Exposed so main.js can ask "should products/combos be refetched right now?"
export function shouldRefetchOnFocus() {
    const prodCached  = readCache(CACHE_CONFIG.products.key);
    const comboCached = readCache(CACHE_CONFIG.combos.key);
    return (
        isCacheStale(prodCached,  CACHE_CONFIG.products.staleTime) ||
        isCacheStale(comboCached, CACHE_CONFIG.combos.staleTime)
    );
}

// ─── Main loader ──────────────────────────────────────────────────────────────
/**
 * Load menu data, served from localStorage cache when fresh.
 * @param {object} options
 * @param {boolean} [options.forceRefresh=false] - Bypass cache and always hit Supabase
 */
export async function loadMenuData({ forceRefresh = false } = {}) {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client not initialized');

    try {
        // ── 1. Categories (staleTime 24 h, no refetchOnFocus) ────────────────
        let categories;
        const cachedCats = readCache(CACHE_CONFIG.categories.key);

        if (!forceRefresh && !isCacheStale(cachedCats, CACHE_CONFIG.categories.staleTime)) {
            categories = cachedCats.data;
            log('📦 Categories: served from cache');
        } else {
            const { data, error } = await supabase.from('categories').select('*');
            if (error) throw error;
            categories = data;
            writeCache(CACHE_CONFIG.categories.key, categories);
            log('🌐 Categories: fetched from Supabase');
        }

        // Build category id → UI key map
        const categoryMap = {};
        categories.forEach(cat => {
            const uiKey = categoryNameMap[cat.name.toLowerCase()] || cat.name.toLowerCase();
            categoryMap[cat.id] = uiKey;
            if (!menuData[uiKey]) menuData[uiKey] = [];
        });

        // ── 2. Products (staleTime 30 min, refetchOnFocus: true) ─────────────
        let products;
        const cachedProds = readCache(CACHE_CONFIG.products.key);

        if (!forceRefresh && !isCacheStale(cachedProds, CACHE_CONFIG.products.staleTime)) {
            products = cachedProds.data;
            log('📦 Products: served from cache');
        } else {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true);
            if (error) throw error;
            products = data;
            writeCache(CACHE_CONFIG.products.key, products);
            log('🌐 Products: fetched from Supabase');
        }

        // Reset product arrays before filling
        Object.keys(menuData).forEach(k => { if (k !== 'combos') menuData[k] = []; });

        products.forEach(prod => {
            const uiKey = categoryMap[prod.category_id];
            if (uiKey && menuData[uiKey]) {
                menuData[uiKey].push({
                    id: prod.id,
                    name: prod.name,
                    price: Number(prod.price),
                    description: prod.description,
                    emoji: prod.emoji,
                    fallbackEmoji: prod.emoji,
                    image: prod.image_path,
                    dbCategory: uiKey
                });
            }
        });

        // ── 3. Combos (staleTime 30 min, refetchOnFocus: true) ───────────────
        let combos;
        const cachedCombos = readCache(CACHE_CONFIG.combos.key);

        if (!forceRefresh && !isCacheStale(cachedCombos, CACHE_CONFIG.combos.staleTime)) {
            combos = cachedCombos.data;
            log('📦 Combos: served from cache');
        } else {
            const { data, error } = await supabase
                .from('combos')
                .select('*')
                .eq('is_active', true);
            if (error) throw error;
            combos = data;
            writeCache(CACHE_CONFIG.combos.key, combos);
            log('🌐 Combos: fetched from Supabase');
        }

        menuData.combos = combos.map(combo => ({
            id: 'combo_' + combo.id,
            name: combo.name,
            price: Number(combo.price),
            description: combo.description,
            emoji: combo.emoji || '🎁',
            fallbackEmoji: combo.emoji || '🎁',
            image: combo.image_path || 'combos/Combos_generico.webp'
        }));

        log('✅ Menu data ready:', menuData);
        return true;

    } catch (err) {
        error('❌ Error loading menu data:', err);
        return false;
    }
}

/**
 * Synchronously populate menuData from localStorage cache.
 * Returns true if ALL three tables had valid, non-stale cache.
 * Call this BEFORE any await to eliminate the skeleton flash on repeat visits.
 */
export function loadMenuDataSync() {
    try {
        const cachedCats   = readCache(CACHE_CONFIG.categories.key);
        const cachedProds  = readCache(CACHE_CONFIG.products.key);
        const cachedCombos = readCache(CACHE_CONFIG.combos.key);

        // Abort if any entry is missing or stale — async loader will handle it
        if (
            isCacheStale(cachedCats,   CACHE_CONFIG.categories.staleTime) ||
            isCacheStale(cachedProds,  CACHE_CONFIG.products.staleTime)   ||
            isCacheStale(cachedCombos, CACHE_CONFIG.combos.staleTime)
        ) return false;

        const categories = cachedCats.data;
        const products   = cachedProds.data;
        const combos     = cachedCombos.data;

        // Build category id → UI key map
        const categoryMap = {};
        categories.forEach(cat => {
            const uiKey = categoryNameMap[cat.name.toLowerCase()] || cat.name.toLowerCase();
            categoryMap[cat.id] = uiKey;
            if (!menuData[uiKey]) menuData[uiKey] = [];
        });

        // Reset and fill products
        Object.keys(menuData).forEach(k => { if (k !== 'combos') menuData[k] = []; });
        products.forEach(prod => {
            const uiKey = categoryMap[prod.category_id];
            if (uiKey && menuData[uiKey]) {
                menuData[uiKey].push({
                    id: prod.id,
                    name: prod.name,
                    price: Number(prod.price),
                    description: prod.description,
                    emoji: prod.emoji,
                    fallbackEmoji: prod.emoji,
                    image: prod.image_path,
                    dbCategory: uiKey
                });
            }
        });

        // Fill combos
        menuData.combos = combos.map(combo => ({
            id: 'combo_' + combo.id,
            name: combo.name,
            price: Number(combo.price),
            description: combo.description,
            emoji: combo.emoji || '🎁',
            fallbackEmoji: combo.emoji || '🎁',
            image: combo.image_path || 'combos/Combos_generico.webp'
        }));

        log('⚡ Menu data loaded synchronously from cache (no flash)');
        return true;
    } catch {
        return false;
    }
}

/**
 * Find an item by ID across all categories
 * @param {number|string} id - Item ID to find
 * @returns {Object|null} - Found item or null
 */
export function findItemById(id) {
    for (let category in menuData) {
        const item = menuData[category].find(i => String(i.id) === String(id));
        if (item) {
            return { ...item, category };
        }
    }
    return null;
}

/**
 * Get full public image URL from Supabase Storage
 * @param {string} category - Category name (unused now as path includes it)
 * @param {string} imagePath - Image path in bucket (e.g., 'broaster/Alita.webp')
 * @returns {string} - Full image URL
 */
export function getImagePath(category, imagePath) {
    if (!imagePath) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/menu-images/${imagePath}`;
}
