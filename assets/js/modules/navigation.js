/**
 * Navigation Module - Optimized
 * Burger & Broaster Express
 * 
 * Handles page navigation and smooth scrolling
 * Performance: Reduced DOM queries, debounced resize, batched reads/writes
 */

// Cache DOM elements to reduce queries
let cachedIndicator = null;
let cachedNavUl = null;
let cachedNavLinks = null;

// Debounce utility for resize handler
let resizeTimeout;
function debounce(fn, delay) {
    return function(...args) {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Navigation Indicator Logic - Batched reads/writes
function updateIndicator(activeLink) {
    if (!cachedIndicator) cachedIndicator = document.querySelector('.nav-indicator');
    if (!cachedNavUl) cachedNavUl = document.querySelector('nav ul');
    
    if (!cachedIndicator || !cachedNavUl || !activeLink) return;

    // Batch read phase
    const listRect = cachedNavUl.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const left = linkRect.left - listRect.left;
    const width = linkRect.width;

    // Batch write phase (single rAF)
    requestAnimationFrame(() => {
        cachedIndicator.classList.add('visible');
        cachedIndicator.style.cssText = `width:${width}px;transform:translate3d(${left}px,-50%,0);top:50%`;
    });
}

// Update on resize (debounced)
const handleResize = debounce(() => {
    if (!cachedNavLinks) cachedNavLinks = document.querySelectorAll('nav a');
    const active = cachedNavLinks.length > 0 ? 
        Array.from(cachedNavLinks).find(link => link.classList.contains('active')) : null;
    if (active) updateIndicator(active);
}, 100);

window.addEventListener('resize', handleResize, { passive: true });

/**
 * Set active navigation link
 * @param {string} navType - 'inicio', 'menu', 'pedido', 'contacto'
 */
function setActiveNav(navType) {
    if (!cachedNavLinks) cachedNavLinks = document.querySelectorAll('nav a');
    
    // Batch class removal
    cachedNavLinks.forEach(link => link.classList.remove('active'));

    const navMap = { 'inicio': 0, 'menu': 1, 'pedido': 2, 'contacto': 3 };
    const index = navMap[navType];

    if (cachedNavLinks[index]) {
        cachedNavLinks[index].classList.add('active');
        requestAnimationFrame(() => updateIndicator(cachedNavLinks[index]));
    }
}

/**
 * Show specific section and hide others
 * @param {string} sectionId - ID of section to show
 */
export function showSection(sectionId) {
    // Cache sections on first use
    if (!showSection._sections) {
        showSection._sections = document.querySelectorAll('.section');
    }
    
    showSection._sections.forEach(section => section.classList.remove('active'));

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    setActiveNav(sectionId);
}

/**
 * Scroll to menu section
 */
export function scrollToMenu() {
    showSection('menu');
    requestAnimationFrame(() => {
        const menuTitle = document.getElementById('menu-title');
        const header = document.querySelector('header');
        if (!menuTitle || !header) return;

        const headerHeight = header.offsetHeight;
        const elementPosition = menuTitle.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    });
}

/**
 * Scroll to order section
 */
export function scrollToPedido() {
    showSection('pedido');
}

// Set initial active (menu is default)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setActiveNav('menu'));
} else {
    setActiveNav('menu');
}

/**
 * Handle social link press (mobile only):
 * Resets all icons instantly, activates the pressed one for 2s, then resets.
 */
let _socialTimer = null;

function handleSocialClick(el) {
    if (!window.matchMedia('(pointer: coarse)').matches) return;

    // Cancel any pending reset
    if (_socialTimer) {
        clearTimeout(_socialTimer);
        _socialTimer = null;
    }

    // Reset ALL social links (cached on first use)
    if (!handleSocialClick._links) {
        handleSocialClick._links = document.querySelectorAll('.social-link');
    }
    
    handleSocialClick._links.forEach(link => {
        link.classList.remove('active-tooltip');
        link.blur();
    });

    // Activate only the pressed one
    el.classList.add('active-tooltip');

    // Auto-reset after 2 seconds
    _socialTimer = setTimeout(() => {
        el.classList.remove('active-tooltip');
        el.blur();
        _socialTimer = null;
    }, 2000);
}

// WhatsApp floating button visibility
function updateWhatsAppVisibility() {
    const whatsappBtn = document.getElementById('whatsappFloat');
    if (!whatsappBtn) return;

    const isCheckoutActive = document.body.classList.contains('checkout-active');
    const contactoSection = document.getElementById('contacto');
    const isContactSection = contactoSection && contactoSection.classList.contains('active');

    if (isCheckoutActive || isContactSection) {
        whatsappBtn.classList.add('hidden');
    } else {
        whatsappBtn.classList.remove('hidden');
    }
}

// Observe body class changes (checkout)
const bodyObserver = new MutationObserver(updateWhatsAppVisibility);
bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

// Observe section class changes (navigation)
const sectionObserver = new MutationObserver(updateWhatsAppVisibility);
document.querySelectorAll('.section').forEach(section => {
    sectionObserver.observe(section, { attributes: true, attributeFilter: ['class'] });
});

// Make navigation functions available globally for onclick handlers
window.showSection = showSection;
window.scrollToMenu = scrollToMenu;
window.scrollToPedido = scrollToPedido;
window.handleSocialClick = handleSocialClick;
