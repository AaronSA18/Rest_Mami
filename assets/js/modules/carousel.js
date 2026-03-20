/**
 * Carousel Module
 * Burger & Broaster Express
 * 
 * Handles infinite carousel functionality for menu categories
 */

import { menuData, getImagePath, generateSrcSet, getResponsiveImagePath } from './menu-data.js';
import { CONFIG } from '../config.js';

// Carousel state
let carouselPositions = {
    broaster: 0,
    burgers: 0,
    salchipapas: 0,
    drinks: 0,
    combos: 0
};

let isTransitioning = {};

/**
 * Initialize menu rendering with optimized IntersectionObserver
 * Performance: Uses higher rootMargin to trigger earlier, fewer callbacks
 */
export async function renderMenu() {
    // Optimized observer options for better performance
    const observerOptions = {
        root: null,
        rootMargin: '200px', // Increased to preload earlier
        threshold: 0.01 // Lower threshold for earlier detection
    };

    // Single observer for all categories (performance optimization)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(async entry => {
            if (entry.isIntersecting) {
                const category = entry.target.dataset.category;
                if (category && entry.target.dataset.rendered !== 'true') {
                    await renderCategory(category);
                }
                // Always unobserve after first intersection
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all category grids
    Object.keys(menuData).forEach(category => {
        const grid = document.getElementById(`${category}-grid`);
        if (grid) {
            grid.dataset.category = category;
            // Skip if already rendered
            if (grid.dataset.rendered !== 'true') {
                observer.observe(grid);
            }
        }
    });
}

/**
 * Render a specific menu category
 * @param {string} category - Category name to render
 */
export async function renderCategory(category) {
    const grid = document.getElementById(`${category}-grid`);
    if (!grid || grid.dataset.rendered === 'true') return;

    const items = menuData[category];
    if (!items) return;

    const isMobile = window.innerWidth <= 768;
    const allItems = isMobile ? items : [...items, ...items, ...items];

    // Yield to main thread (TBT chunking pattern) before heavy string manipulation
    await new Promise(resolve => setTimeout(resolve, 0));

    grid.innerHTML = allItems.map((item, index) => renderMenuItem(item, index, category)).join('');
    grid.dataset.rendered = 'true';

    if (!isMobile) {
        carouselPositions[category] = items.length;
        updateCarouselPosition(category, false);
    } else {
        initMobileProgressBar(category, grid);
    }
}

/**
 * Helper to render a single menu item HTML
 */
function renderMenuItem(item, index, category) {
    const imagePath = item.image ? getImagePath(category, item.image) : null;
    // Preload first 2 items of Broaster category for LCP/speed
    const isPriority = category === 'broaster' && index < 2;
    const loadingAttr = isPriority ? '' : 'loading="lazy"';
    const priorityAttr = isPriority ? 'fetchpriority="high"' : '';
    
    // Note: srcset generation removed as the physical resized files were reverted
    return `
        <div class="menu-item" data-index="${index}">
            <div class="menu-item-image">
                ${imagePath
                    ? `<img src="${imagePath}" alt="${item.name}" ${loadingAttr} ${priorityAttr}
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <div style="display:none; align-items:center; 
                             justify-content:center; font-size:4rem; background:linear-gradient(135deg, #FFC107 0%, #FF9800 100%);">
                             ${item.fallbackEmoji || item.emoji}
                       </div>`
            : `<div style="display:flex;align-items:center; 
                             justify-content:center; font-size:4rem; background:linear-gradient(135deg, #FFC107 0%, #FF9800 100%);">
                             ${item.fallbackEmoji || item.emoji}
                       </div>`
        }
            </div>
            <div class="menu-item-content">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <div class="price-cart">
                    <span class="price">S/ ${item.price.toFixed(2)}</span>
                    <button class="add-to-cart" onclick="window.addToCart(${item.id})">Agregar</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Initialize progress bar for mobile carousel
 * @param {string} category - Category name
 * @param {HTMLElement} grid - Grid element
 */
function initMobileProgressBar(category, grid) {
    const wrapper = grid.parentElement;
    const container = wrapper?.parentElement;
    if (!wrapper || !container) return;

    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    container.appendChild(progressBar);

    // Calculate initial bar width based on visible portion
    const updateProgressBar = () => {
        const scrollLeft = wrapper.scrollLeft;
        const scrollWidth = wrapper.scrollWidth;
        const clientWidth = wrapper.clientWidth;
        const maxScroll = scrollWidth - clientWidth;

        // Calculate progress (0 to 1)
        const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;

        // Calculate bar width (proportional to visible content)
        const trackWidth = container.offsetWidth - 32; // minus padding
        const barWidth = Math.max(30, (clientWidth / scrollWidth) * trackWidth);

        // Calculate bar position
        const maxBarTravel = trackWidth - barWidth;
        const barPosition = progress * maxBarTravel;

        progressBar.style.width = `${barWidth}px`;
        progressBar.style.transform = `translateX(${barPosition}px)`;

        // Mark start and end with color change
        if (scrollLeft <= 5) {
            // At start
            progressBar.classList.add('at-start');
            progressBar.classList.remove('at-end');
        } else if (scrollLeft >= maxScroll - 5) {
            // At end
            progressBar.classList.add('at-end');
            progressBar.classList.remove('at-start');
        } else {
            // In middle
            progressBar.classList.remove('at-start');
            progressBar.classList.remove('at-end');
        }
    };

    // Initial update
    updateProgressBar();

    // Update on scroll
    wrapper.addEventListener('scroll', updateProgressBar);

    // Update on resize
    window.addEventListener('resize', updateProgressBar);
}

/**
 * Update carousel position
 * @param {string} category - Category name
 * @param {boolean} animate - Whether to animate the transition
 */
function updateCarouselPosition(category, animate = true) {
    const grid = document.getElementById(`${category}-grid`);
    if (!grid) return;

    const items = grid.querySelectorAll('.menu-item');
    if (items.length === 0) return;

    const itemWidth = items[0].offsetWidth;
    const gap = CONFIG.carousel.itemGap;
    const offset = carouselPositions[category] * (itemWidth + gap);

    if (!animate) {
        grid.style.transition = 'none';
    } else {
        grid.style.transition = `transform ${CONFIG.carousel.transitionDuration}ms ease-in-out`;
    }

    grid.style.transform = `translateX(-${offset}px)`;
}

/**
 * Move carousel in specified direction
 * @param {string} category - Category name
 * @param {number} direction - Direction to move (-1 for left, 1 for right)
 */
export function moveCarousel(category, direction) {
    if (isTransitioning[category]) return;

    isTransitioning[category] = true;
    const items = menuData[category];
    const totalItems = items.length;

    carouselPositions[category] += direction;
    updateCarouselPosition(category, true);

    setTimeout(() => {
        // Jump to second set if at end
        if (carouselPositions[category] >= totalItems * 2) {
            carouselPositions[category] = totalItems;
            updateCarouselPosition(category, false);
        }
        // Jump to second set if at beginning
        else if (carouselPositions[category] < totalItems) {
            carouselPositions[category] = totalItems * 2 - 1;
            updateCarouselPosition(category, false);
        }

        isTransitioning[category] = false;
    }, CONFIG.carousel.transitionDuration);
}

// Make moveCarousel available globally for onclick handlers
window.moveCarousel = moveCarousel;
