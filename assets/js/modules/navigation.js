/**
 * Navigation Module
 * Burger & Broaster Express
 * 
 * Handles page navigation and smooth scrolling
 */

// Navigation Indicator Logic
function updateIndicator(activeLink) {
    const indicator = document.querySelector('.nav-indicator');
    const navUl = document.querySelector('nav ul');
    if (!indicator || !navUl || !activeLink) return;

    // Make visible
    indicator.classList.add('visible');

    // Calculate position relative to container
    const listRect = navUl.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const left = linkRect.left - listRect.left;

    // Apply strict horizontal translation
    // We use translate3d for hardware acceleration
    indicator.style.width = `${linkRect.width}px`;
    indicator.style.transform = `translate3d(${left}px, -50%, 0)`;
    indicator.style.top = '50%';
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

// Make navigation functions available globally for onclick handlers
window.showSection = showSection;
window.scrollToMenu = scrollToMenu;
window.scrollToPedido = scrollToPedido;

