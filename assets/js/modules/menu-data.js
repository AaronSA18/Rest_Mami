/**
 * Menu Data Module
 * Burger & Broaster Express
 * 
 *  all menu items organized by category
 */

export const menuData = {
    broaster: [
        {
            id: 1,
            name: 'Alita de Pollo',
            price: 10.00,
            emoji: '🍗',
            description: 'Crujientes alitas de pollo broaster doradas y jugosas',
            image: 'Alita.webp',
            fallbackEmoji: '🍗'
        },
        {
            id: 2,
            name: 'Pierna de Pollo',
            price: 12.00,
            emoji: '🍗',
            description: 'Jugosa pierna de pollo broaster con piel crujiente',
            image: 'Pierna.webp',
            fallbackEmoji: '🍗'
        },
        {
            id: 3,
            name: 'Entrepierna de Pollo',
            price: 12.00,
            emoji: '🍗',
            description: 'Tierna entrepierna de pollo con sabor inigualable',
            image: 'Entrepierna.webp',
            fallbackEmoji: '🍗'
        },
        {
            id: 4,
            name: 'Pecho de Pollo',
            price: 13.00,
            emoji: '🍗',
            description: 'Pechuga de pollo jugosa y bien sazonada',
            image: 'Pechodepollo.webp',
            fallbackEmoji: '🍗'
        }
    ],

    burgers: [
        {
            id: 5,
            name: 'Hamburguesa de Pollo',
            price: 6.00,
            emoji: '🍔',
            description: 'Jugosa hamburguesa de pollo con lechuga y tomate',
            image: 'H_pollo.webp',
            fallbackEmoji: '🍔'
        },
        {
            id: 6,
            name: 'Hamburguesa de Carne',
            price: 8.00,
            emoji: '🍔',
            description: 'Deliciosa hamburguesa de carne con queso y vegetales',
            image: 'H_carne.webp',
            fallbackEmoji: '🍔'
        },
        {
            id: 7,
            name: 'Hamburguesa de Chorizo',
            price: 8.00,
            emoji: '🍔',
            description: 'Sabrosa hamburguesa con chorizo parrillero',
            image: 'H_chorizo.webp',
            fallbackEmoji: '🍔'
        },
        {
            id: 8,
            name: 'Hamburguesa Mixta',
            price: 10.00,
            emoji: '🍔',
            description: 'Combinación perfecta de pollo y carne',
            image: 'H_mixta.webp',
            fallbackEmoji: '🍔'
        },
        {
            id: 9,
            name: 'Hamburguesa Royal',
            price: 12.00,
            emoji: '👑',
            description: 'La hamburguesa premium con todos los ingredientes',
            image: 'H_royal.webp',
            fallbackEmoji: '👑'
        }
    ],

    salchipapas: [
        {
            id: 10,
            name: 'Salchipapa Clásica',
            price: 8.00,
            emoji: '🌭',
            description: 'Papas fritas crujientes con salchicha y salsas',
            image: 'S_.webp',
            fallbackEmoji: '🌭'
        },
        {
            id: 11,
            name: 'Salchipapa Especial',
            price: 12.00,
            emoji: '🌭',
            description: 'Con huevo, queso y salchichas premium',
            image: 'S_especial.webp',
            fallbackEmoji: '🌭'
        },
        {
            id: 12,
            name: 'Salchipollo',
            price: 15.00,
            emoji: '🌭',
            description: 'Papas fritas con pollo broaster y salchicha',
            image: 'S_pollo.webp',
            fallbackEmoji: '🌭'
        }
    ],

    drinks: [
        {
            id: 13,
            name: 'Inka Cola 500ml',
            price: 3.50,
            emoji: '🥤',
            description: 'Refrescante bebida peruana',
            image: 'inka-cola500ml.webp'
        },
        {
            id: 14,
            name: 'Coca Cola 500ml',
            price: 3.50,
            emoji: '🥤',
            description: 'Clásica Coca Cola',
            image: 'COCA-COLA500ml.webp'
        },
        {
            id: 15,
            name: 'Guaraná 450ml',
            price: 2.00,
            emoji: '🥤',
            description: 'Energizante bebida de guaraná',
            image: 'guarana450ml.webp'
        }
    ],

    combos: [
        {
            id: 16,
            name: 'Combo Pollo',
            price: 12.00,
            emoji: '🎁',
            description: 'Hamburguesa de pollo + Broaster + Bebida',
            fallbackEmoji: '🎁'
        },
        {
            id: 17,
            name: 'Combo Carne',
            price: 12.00,
            emoji: '🎁',
            description: 'Hamburguesa de carne + Broaster + Bebida',
            fallbackEmoji: '🎁'
        },
        {
            id: 18,
            name: 'Combo Familiar',
            price: 35.00,
            emoji: '🎁',
            description: '2 Hamburguesas + 4 Broasters + 4 Bebidas',
            fallbackEmoji: '🎁'
        }
    ]
};

/**
 * Find an item by ID across all categories
 * @param {number} id - Item ID to find
 * @returns {Object|null} - Found item or null
 */
export function findItemById(id) {
    for (let category in menuData) {
        const item = menuData[category].find(i => i.id === id);
        if (item) {
            return { ...item, category };
        }
    }
    return null;
}

/**
 * Get image path for a category
 * @param {string} category - Category name
 * @param {string} imageName - Image file name
 * @returns {string} - Full image path
 */
export function getImagePath(category, imageName) {
    return `assets/images/${category}/${imageName}`;
}
