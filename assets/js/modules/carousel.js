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
 * Derives the -sm and -lg responsive paths from a base .webp image path.
 *
 * Convention:
 *   Base →  assets/images/broaster/Alita.webp
 *   Small → assets/images/broaster/Alita-sm.webp  (320×200 px, calidad 80%)
 *   Large → assets/images/broaster/Alita-lg.webp  (640×400 px, calidad 80%)
 *
 * Prepara ambos archivos con Squoosh.app antes de desplegar.
 *
 * @param {string} fullPath - Ruta base devuelta por getImagePath()
 * @returns {{ sm: string, lg: string }}
 */
function getResponsivePaths(fullPath) {
    // Inserta el sufijo antes de la extensión: Alita.webp → Alita-sm.webp
    const sm = fullPath.replace(/\.webp$/i, '-sm.webp');
    const lg = fullPath.replace(/\.webp$/i, '-lg.webp');
    return { sm, lg };
}

/**
 * Initialize menu rendering with optimized IntersectionObserver
 * Performance: Uses higher rootMargin to trigger earlier, fewer callbacks
 */
export async function renderMenu() {
    const observerOptions = {
        root: null,
        rootMargin: '200px',
        threshold: 0.01
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(async entry => {
            if (entry.isIntersecting) {
                const category = entry.target.dataset.category;
                if (category && entry.target.dataset.rendered !== 'true') {
                    await renderCategory(category);
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    Object.keys(menuData).forEach(category => {
        const grid = document.getElementById(`${category}-grid`);
        if (grid) {
            grid.dataset.category = category;
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

    await new Promise(resolve => setTimeout(resolve, 0));

    grid.innerHTML = allItems
        .map((item, index) => renderMenuItem(item, index, category))
        .join('');
    grid.dataset.rendered = 'true';

    if (!isMobile) {
        carouselPositions[category] = items.length;
        updateCarouselPosition(category, false);
    } else {
        initMobileProgressBar(category, grid);
    }
}

/**
 * Render a single menu item using <picture> + srcset.
 *
 * ─── VERSIÓN ACTIVA ───────────────────────────────────────────────────────
 *  ✅ Usa -sm (320w) como fuente principal — ya existe en disco
 *  ✅ Fallback al original por si -sm no carga
 *  ⏳ Cuando tengas -lg listo, agrégalo al srcset: "${sm} 320w, ${lg} 640w"
 *  ✅ width + height declarados → evita Layout Shift (CLS)
 *  ✅ loading="lazy" en todas las imágenes no críticas
 *  ✅ fetchpriority="high" solo en las 2 primeras de broaster (LCP)
 *  ✅ decoding="async" en imágenes no prioritarias
 *  ✅ object-fit: cover + border-radius rectangular con bordes redondeados
 * ──────────────────────────────────────────────────────────────────────────
 */
function renderMenuItem(item, index, category) {
    const basePath = item.image ? getImagePath(category, item.image) : null;

    // Carga balanceada: lazy loading y decodificación asíncrona para todos los ítems
    const loadingAttr = 'loading="lazy"';
    const decodingAttr = 'decoding="async"';
    const priorityAttr = '';

    // Imagen responsiva con <picture> — usando -sm para móviles y original para desktop
    const imageHTML = basePath
        ? (() => {
            const { sm } = getResponsivePaths(basePath);
            return `
                <picture>
                  <source
                    srcset="${sm}"
                    media="(max-width: 768px)"
                    type="image/webp"
                  />
                  <img
                    src="${basePath}"
                    alt="${item.name}"
                    width="400"
                    height="250"
                    ${loadingAttr}
                    ${decodingAttr}
                    ${priorityAttr}
                    class="menu-item-img"
                    onload="this.parentElement.nextElementSibling.classList.remove('active')"
                    onerror="
                      this.closest('.menu-item-image').querySelector('.menu-item-fallback').classList.add('active');
                      this.style.display='none';
                    "
                  />
                </picture>
                <div class="menu-item-fallback active">
                  ${item.fallbackEmoji || item.emoji}
                </div>`;
        })()
        : `
            <div class="menu-item-fallback icon-fallback active">
              ${item.fallbackEmoji || item.emoji}
            </div>`;

    return `
        <div class="menu-item" data-index="${index}">
            <div class="menu-item-image" style="border-radius: 16px 16px 0 0; overflow: hidden;">
                ${imageHTML}
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
 */
function initMobileProgressBar(category, grid) {
    const wrapper = grid.parentElement;
    const container = wrapper?.parentElement;
    if (!wrapper || !container) return;

    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    container.appendChild(progressBar);

    const updateProgressBar = () => {
        const scrollLeft = wrapper.scrollLeft;
        const scrollWidth = wrapper.scrollWidth;
        const clientWidth = wrapper.clientWidth;
        const maxScroll = scrollWidth - clientWidth;
        const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
        const trackWidth = container.offsetWidth - 32;
        const barWidth = Math.max(30, (clientWidth / scrollWidth) * trackWidth);
        const maxBarTravel = trackWidth - barWidth;
        const barPosition = progress * maxBarTravel;

        progressBar.style.width = `${barWidth}px`;
        progressBar.style.transform = `translateX(${barPosition}px)`;

        if (scrollLeft <= 5) {
            progressBar.classList.add('at-start');
            progressBar.classList.remove('at-end');
        } else if (scrollLeft >= maxScroll - 5) {
            progressBar.classList.add('at-end');
            progressBar.classList.remove('at-start');
        } else {
            progressBar.classList.remove('at-start', 'at-end');
        }
    };

    updateProgressBar();
    wrapper.addEventListener('scroll', updateProgressBar);
    window.addEventListener('resize', updateProgressBar);
}

/**
 * Update carousel transform position
 */
function updateCarouselPosition(category, animate = true) {
    const grid = document.getElementById(`${category}-grid`);
    if (!grid) return;

    const items = grid.querySelectorAll('.menu-item');
    if (items.length === 0) return;

    const itemWidth = items[0].offsetWidth;
    const gap = CONFIG.carousel.itemGap;
    const offset = carouselPositions[category] * (itemWidth + gap);

    grid.style.transition = animate
        ? `transform ${CONFIG.carousel.transitionDuration}ms ease-in-out`
        : 'none';

    grid.style.transform = `translateX(-${offset}px)`;
}

/**
 * Move carousel in specified direction
 */
export function moveCarousel(category, direction) {
    if (isTransitioning[category]) return;

    isTransitioning[category] = true;
    const items = menuData[category];
    const totalItems = items.length;

    carouselPositions[category] += direction;
    updateCarouselPosition(category, true);

    setTimeout(() => {
        if (carouselPositions[category] >= totalItems * 2) {
            carouselPositions[category] = totalItems;
            updateCarouselPosition(category, false);
        } else if (carouselPositions[category] < totalItems) {
            carouselPositions[category] = totalItems * 2 - 1;
            updateCarouselPosition(category, false);
        }
        isTransitioning[category] = false;
    }, CONFIG.carousel.transitionDuration);
}

window.moveCarousel = moveCarousel;