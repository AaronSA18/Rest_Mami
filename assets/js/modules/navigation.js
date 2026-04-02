/**
 * Navigation Module
 * Burger & Broaster Express
 * 
 * Handles page navigation and smooth scrolling
 */

// Cache for nav measurements to reduce reflows
let navMeasurements = null;

// Navigation Indicator Logic
function updateIndicator(activeLink) {
    const indicator = document.querySelector('.nav-indicator');
    const navUl = document.querySelector('nav ul');
    if (!indicator || !navUl || !activeLink) return;

    // Use requestAnimationFrame to ensure we read and write in separate phases
    requestAnimationFrame(() => {
        // Read Phase
        const listRect = navUl.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        const left = linkRect.left - listRect.left;
        const width = linkRect.width;

        // Write Phase
        requestAnimationFrame(() => {
            indicator.classList.add('visible');
            indicator.style.width = `${width}px`;
            indicator.style.transform = `translate3d(${left}px, -50%, 0)`;
            indicator.style.top = '50%';
        });
    });
}

// Update on resize
window.addEventListener('resize', () => {
    const active = document.querySelector('nav a.active');
    if (active) updateIndicator(active);
});

/**
 * Set active navigation link
 * @param {string} navType - 'inicio', 'menu', 'pedido', 'contacto'
 */
function setActiveNav(navType) {
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });

    const navMap = { 'inicio': 0, 'menu': 1, 'pedido': 2, 'contacto': 3 };
    const navLinks = document.querySelectorAll('nav a');
    const index = navMap[navType];

    if (navLinks[index]) {
        navLinks[index].classList.add('active');
        // Trigger animation frame for smoothness
        requestAnimationFrame(() => {
            updateIndicator(navLinks[index]);
        });
    }
}

/**
 * Show specific section and hide others
 * @param {string} sectionId - ID of section to show
 */
export function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo(0, 0);
    }

    setActiveNav(sectionId);
}

/**
 * Scroll to menu section
 */
export function scrollToMenu() {
    showSection('menu');
    setTimeout(() => {
        const menuTitle = document.getElementById('menu-title');
        const header = document.querySelector('header');

        if (!menuTitle || !header) return;

        const headerHeight = header.offsetHeight;
        const elementPosition = menuTitle.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }, 100);
}

/**
 * Scroll to order section
 */
export function scrollToPedido() {
    showSection('pedido');
}

// Set initial active (menu is default)
document.addEventListener('DOMContentLoaded', () => {
    setActiveNav('menu');
});

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

    // Reset ALL social links first
    document.querySelectorAll('.social-link').forEach(link => {
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

// Make navigation functions available globally for onclick handlers
window.showSection = showSection;
window.scrollToMenu = scrollToMenu;
window.scrollToPedido = scrollToPedido;
window.handleSocialClick = handleSocialClick;
