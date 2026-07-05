/**
 * Carousel Module
 * Burger & Broaster Express
 * 
 * Handles infinite carousel functionality for menu categories
 */

import { menuData, getImagePath } from './menu-data.js';
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
 * Initialize menu rendering.
 * @param {object} options
 * @param {boolean} [options.immediate=false]
 *   When true, renders all categories synchronously without waiting for
 *   IntersectionObserver callbacks. Use this when data is already available
 *   in menuData (e.g. loaded from cache) to avoid the skeleton flash.
 */
export function renderMenu({ immediate = false } = {}) {
    if (immediate) {
        // Bypass the observer — render all categories right now.
        // Called when we have data from the synchronous cache hit.
        Object.keys(menuData).forEach(category => {
            renderCategory(category);
        });
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const category = entry.target.dataset.category;
                renderCategory(category);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all category grids
    Object.keys(menuData).forEach(category => {
        const grid = document.getElementById(`${category}-grid`);
        if (grid) {
            grid.dataset.category = category;
            observer.observe(grid);
        }
    });
}

/**
 * Render a specific menu category
 * @param {string} category - Category name to render
 */
export function renderCategory(category) {
    const grid = document.getElementById(`${category}-grid`);
    if (!grid || grid.dataset.rendered === 'true') return;

    const items = menuData[category];
    if (!items) return;

    const isMobile = window.innerWidth <= 768;
    const allItems = isMobile ? items : [...items, ...items, ...items];

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
 * Optimized for performance with responsive images and proper dimensions
 */
function renderMenuItem(item, index, category) {
    const imagePath = item.image ? getImagePath(category, item.image) : null;
    // Preload first 2 items of Broaster category for LCP/speed
    const isPriority = category === 'broaster' && index < 2;
    const loadingAttr = isPriority ? '' : 'loading="lazy"';
    const priorityAttr = isPriority ? 'fetchpriority="high"' : '';
    const decodingAttr = 'decoding="async"';
    
    // Responsive image dimensions based on category
    const dimensions = {
        broaster: { w: 460, h: 230 },
        burgers: { w: 500, h: 250 },
        salchipapas: { w: 500, h: 250 },
        drinks: { w: 400, h: 200 },
        combos: { w: 440, h: 220 }
    };
    const { w, h } = dimensions[category] || { w: 400, h: 200 };

    return `
        <div class="menu-item" data-index="${index}">
            <div class="menu-item-image">
                ${imagePath
            ? `<div style="position: relative; width: 100%; height: 100%;">
                   <div style="position: absolute; inset: 0; margin-left: 41%; display: flex; align-items: center; ">
                       ${item.fallbackEmoji || item.emoji || '🍽️'}
                   </div>
                   <img src="${imagePath}?w=${w}&q=80&fm=webp" 
                        alt="${item.name} - ${category}" 
                        width="${w}" 
                        height="${h}" 
                        ${loadingAttr} 
                        ${priorityAttr}
                        ${decodingAttr}
                        style="position: relative; z-index: 2; opacity: 0; transition: opacity 0.3s ease; width: 100%; height: 100%; object-fit: cover;" 
                        onload="this.style.opacity=1;" 
                        onerror="this.style.display='none'">
               </div>`
            : `<div style="display:flex;align-items:center; justify-content:center; font-size:4rem;">
                   ${item.fallbackEmoji || item.emoji || '🍽️'}
               </div>`
        }
            </div>
            <div class="menu-item-content">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <div class="price-cart">
                    <span class="price">S/ ${item.price.toFixed(2)}</span>
                    <button class="add-to-cart" onclick="window.addToCart('${item.id}')">Agregar</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Initialize progress bar for mobile carousel - Optimized
 * @param {string} category - Category name
 * @param {HTMLElement} grid - Grid element
 * Performance: Batched reads/writes, debounced resize, passive listeners
 */
function initMobileProgressBar(category, grid) {
    const wrapper = grid.parentElement;
    const container = wrapper?.parentElement;
    if (!wrapper || !container) return;

    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    container.appendChild(progressBar);

    // Cache DOM measurements
    let cachedTrackWidth = container.offsetWidth - 32;
    let rafId = null;

    // Debounce utility
    let resizeTimeout;
    const debounce = (fn, delay) => (...args) => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => fn(...args), delay);
    };

    // Calculate initial bar width based on visible portion
    const updateProgressBar = () => {
        // Cancel any pending animation frame
        if (rafId) cancelAnimationFrame(rafId);

        // Batch read phase
        const scrollLeft = wrapper.scrollLeft;
        const scrollWidth = wrapper.scrollWidth;
        const clientWidth = wrapper.clientWidth;
        const maxScroll = scrollWidth - clientWidth;

        // Calculate progress (0 to 1)
        const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;

        // Calculate bar width (proportional to visible content)
        const barWidth = Math.max(30, (clientWidth / scrollWidth) * cachedTrackWidth);

        // Calculate bar position
        const maxBarTravel = cachedTrackWidth - barWidth;
        const barPosition = progress * maxBarTravel;

        // Batch write phase using rAF
        rafId = requestAnimationFrame(() => {
            progressBar.style.cssText = `width:${barWidth}px;transform:translateX(${barPosition}px)`;

            // Mark start and end with color change
            if (scrollLeft <= 5) {
                progressBar.classList.add('at-start');
                progressBar.classList.remove('at-end');
            } else if (scrollLeft >= maxScroll - 5) {
                progressBar.classList.add('at-end');
                progressBar.classList.remove('at-start');
            } else {
                progressBar.classList.remove('at-start', 'at-end');
            }
        });
    };

    // Initial update
    updateProgressBar();

    // Update on scroll (passive for better performance)
    wrapper.addEventListener('scroll', updateProgressBar, { passive: true });

    // Update on resize (debounced)
    window.addEventListener('resize', debounce(() => {
        cachedTrackWidth = container.offsetWidth - 32;
        updateProgressBar();
    }, 100), { passive: true });
}

/**
 * Update carousel position - Optimized
 * @param {string} category - Category name
 * @param {boolean} animate - Whether to animate the transition
 * Performance: Cached measurements, batched writes, GPU-accelerated
 */
function updateCarouselPosition(category, animate = true) {
    const grid = document.getElementById(`${category}-grid`);
    if (!grid) return;

    const items = grid.querySelectorAll('.menu-item');
    if (items.length === 0) return;

    // Batch read phase
    const itemWidth = items[0].offsetWidth;
    const gap = CONFIG.carousel.itemGap;
    const offset = carouselPositions[category] * (itemWidth + gap);

    // Batch write phase
    if (!animate) {
        grid.style.cssText = `transition:none;will-change:auto;transform:translateX(-${offset}px)`;
    } else {
        // GPU-accelerated animation
        grid.style.cssText = `will-change:transform;transition:transform ${CONFIG.carousel.transitionDuration}ms ease-in-out;transform:translateX(-${offset}px)`;
    }
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

        // Limpiar will-change al terminar la transición (liberar capa GPU)
        const grid = document.getElementById(`${category}-grid`);
        if (grid) grid.style.willChange = 'auto';

        isTransitioning[category] = false;
    }, CONFIG.carousel.transitionDuration);
}

// Make moveCarousel available globally for onclick handlers
window.moveCarousel = moveCarousel;
