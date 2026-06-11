/**
 * Menu Data Module
 * Burger & Broaster Express
 * 
 * Fetches menu items from Supabase and organizes them by category
 */

import { getSupabase, SUPABASE_URL } from './supabase.js';

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

export async function loadMenuData() {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client not initialized');

    try {
        // 1. Fetch categories
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*');
            
        if (catError) throw catError;

        // Map category ID to our internal keys
        const categoryMap = {};
        categories.forEach(cat => {
            const uiKey = categoryNameMap[cat.name.toLowerCase()] || cat.name.toLowerCase();
            categoryMap[cat.id] = uiKey;
            // Initialize array if it doesn't exist
            if (!menuData[uiKey]) {
                menuData[uiKey] = [];
            }
        });

        // 2. Fetch active products
        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true);

        if (prodError) throw prodError;

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
                    // Store the raw category for reference
                    dbCategory: uiKey
                });
            }
        });

        // 3. Fetch active combos
        const { data: combos, error: comboError } = await supabase
            .from('combos')
            .select('*')
            .eq('is_active', true);

        if (comboError) throw comboError;

        menuData.combos = combos.map(combo => ({
            id: 'combo_' + combo.id, // Prefix to avoid ID collisions with products
            name: combo.name,
            price: Number(combo.price),
            description: combo.description,
            emoji: combo.emoji || '🎁',
            fallbackEmoji: combo.emoji || '🎁',
            image: combo.image_path || 'combos/Combos_generico.webp'
        }));

        console.log('✅ Menu data loaded from Supabase:', menuData);
        return true;
    } catch (error) {
        console.error('❌ Error loading menu data:', error);
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
    // Combos explicitly use this per user instruction, or any other path provided by DB
    return `${SUPABASE_URL}/storage/v1/object/public/menu-images/${imagePath}`;
}
