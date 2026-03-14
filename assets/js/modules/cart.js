/**
 * Cart Module
 * Burger & Broaster Express
 * 
 * Handles shopping cart functionality and order processing
 */

import { findItemById } from './menu-data.js';
import { CONFIG } from '../config.js';
import { showSection } from './navigation.js';

// Cart state
let cart = [];

// Initialize cart from sessionStorage on load
function loadCartFromStorage() {
    try {
        const saved = sessionStorage.getItem('restaurantCart');
        if (saved) {
            cart = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading cart from storage:', e);
        cart = [];
    }
}

// Save cart to sessionStorage
function saveCartToStorage() {
    try {
        sessionStorage.setItem('restaurantCart', JSON.stringify(cart));
    } catch (e) {
        console.error('Error saving cart to storage:', e);
    }
}

/**
 * Add item to cart
 * @param {number} itemId - ID of item to add
 */
export function addToCart(itemId) {
    const item = findItemById(itemId);
    if (!item) return;

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === itemId);

    if (existingItemIndex !== -1) {
        // Increment quantity if exists
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
    } else {
        // Add new item with quantity 1
        cart.push({ ...item, quantity: 1 });
    }

    // Use simplified message with check icon for mobile/responsive feel
    showNotification('✅ Agregado con éxito');
    updateCart();
    // Update badge count
    updateCartBadge();
    // Save to sessionStorage
    saveCartToStorage();
}

/**
 * Update cart badge count
 */
function updateCartBadge() {
    const badge = document.querySelector('.cart-count');
    if (!badge) return;

    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = count;

    if (count > 0) {
        badge.classList.add('visible');
    } else {
        badge.classList.remove('visible');
    }
}

/**
 * Remove item from cart
 * @param {number} itemId - ID of item to remove
 */
export function removeFromCart(itemId) {
    const index = cart.findIndex(item => item.id === itemId);
    if (index !== -1) {
        cart.splice(index, 1);
        updateCart();
        updateCartBadge();
        saveCartToStorage();
    }
}

/**
 * Update item quantity
 * @param {number} itemId - ID of item
 * @param {number} change - Change in quantity (+1 or -1)
 */
export function updateQuantity(itemId, change) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        updateCart();
        updateCartBadge();
        saveCartToStorage();
    }
}

/**
 * Update cart display
 */
export function updateCart() {
    const cartItemsDiv = document.getElementById('cart-items');
    const totalDiv = document.getElementById('total-price');
    const proceedBtn = document.getElementById('proceedBtn');

    if (!cartItemsDiv || !totalDiv) return;

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
        totalDiv.textContent = 'Total: S/ 0.00';
        if (proceedBtn) proceedBtn.disabled = true;
    } else {
        let html = '';
        let total = 0;

        cart.forEach((item) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            // Construct image path
            // Note: fallback to emoji if image fails loads (handled by onerror not inline, but layout assumes image)
            // We use a container for the image/emoji
            const imagePath = `assets/images/${item.category}/${item.image}`;

            html += `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${imagePath}" alt="${item.name}" onerror="this.parentElement.innerHTML='<span style=\'font-size:2rem\'>${item.emoji}</span>'">
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>S/ ${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="window.updateQuantity(${item.id}, -1)">−</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="window.updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
            `;
        });

        cartItemsDiv.innerHTML = html;
        totalDiv.textContent = `Total: S/ ${total.toFixed(2)}`;
        if (proceedBtn) proceedBtn.disabled = false;
    }

    // Also check form validity in case user is already in step 2
    checkFormValidity();
}

/**
 * Show checkout form (Step 2)
 */
export function showCheckoutForm() {
    const form = document.getElementById('checkout-form');
    const summaryStep = document.getElementById('order-summary-step');

    if (form && summaryStep) {
        summaryStep.style.display = 'none'; // Hide Order Summary (Step 1)
        form.style.display = 'block'; // Show Form (Step 2)
        window.scrollTo(0, 0); // Scroll to top
    }
}

/**
 * Hide checkout form (Go back to Step 1)
 */
export function hideCheckoutForm() {
    const form = document.getElementById('checkout-form');
    const summaryStep = document.getElementById('order-summary-step');

    if (form && summaryStep) {
        form.style.display = 'none';
        summaryStep.style.display = 'block';
    }
}

/**
 * Check if order form is valid
 */
function checkFormValidity() {
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const districtInput = document.getElementById('customerDistrict');
    const addressInput = document.getElementById('customerAddress');
    const coordsInput = document.getElementById('customerCoordinates');
    const paymentMethod = document.getElementById('paymentMethod');
    const nextStepBtn = document.getElementById('nextStepBtn');

    if (!nameInput || !phoneInput || !districtInput || !addressInput || !nextStepBtn) return;

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const district = districtInput.value.trim();
    const address = addressInput.value.trim();
    const coords = coordsInput.value.trim();
    const payment = paymentMethod.value.trim();

    if (name && phone && district && address && coords && payment && cart.length > 0) {
        nextStepBtn.disabled = false;
    } else {
        nextStepBtn.disabled = true;
    }
}

/**
 * Select payment method
 * @param {string} method - Payment method (yape, plin, efectivo)
 */
export function selectPaymentMethod(method) {
    // Update hidden input
    document.getElementById('paymentMethod').value = method;
    
    // Update button styles
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-method="${method}"]`).classList.add('selected');
    
    // Check form validity
    checkFormValidity();
}

/**
 * Show payment reminder modal
 */
export function showPaymentReminder() {
    const modal = document.getElementById('paymentReminderModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Hide payment reminder modal
 */
export function hidePaymentReminder() {
    const modal = document.getElementById('paymentReminderModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Show thank you modal
 */
function showThankYouModal() {
    const modal = document.getElementById('thankYouModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Close thank you modal and redirect to inicio
 */
export function closeThankYouModal() {
    const modal = document.getElementById('thankYouModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Redirect to inicio
    showSection('inicio');
}

/**
 * Finalize order and send via EmailJS to business email
 */
export async function finalizeOrder() {
    hidePaymentReminder();
    
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const district = document.getElementById('customerDistrict').value;
    const address = document.getElementById('customerAddress').value;
    const reference = document.getElementById('customerReference').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const comments = document.getElementById('customerComments').value;
    const coordinates = document.getElementById('customerCoordinates').value;

    // Build order details
    let total = 0;
    let orderDetailsList = [];
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        orderDetailsList.push({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: itemTotal
        });
    });

    // Prepare order items list for email
    const orderItemsText = orderDetailsList.map(item => 
        `${item.name} x${item.quantity} - S/ ${item.subtotal.toFixed(2)}`
    ).join('\n');

    // Send email via EmailJS
    try {
        if (typeof emailjs !== 'undefined') {
            // Initialize EmailJS
            emailjs.init(CONFIG.emailjs.publicKey);

            // Prepare email parameters matching the template variables
            const emailParams = {
                to_name: name,
                to_email: CONFIG.emailjs.businessEmail,
                customer_phone: phone,
                customer_address: address,
                customer_district: district,
                customer_reference: reference || 'Sin referencia',
                order_items: orderItemsText,
                payment_method: paymentMethod.toUpperCase(),
                order_total: total.toFixed(2),
                customer_comments: comments || 'Sin comentarios adicionales',
                order_date: new Date().toLocaleString('es-PE'),
                coordinates: coordinates || 'No disponibles'
            };

            // Send email to business
            await emailjs.send(
                CONFIG.emailjs.serviceId,
                CONFIG.emailjs.templateId,
                emailParams
            );
            console.log('✅ Pedido enviado exitosamente al email de la empresa');
            showNotification('✅ Pedido enviado correctamente');
        }
    } catch (emailError) {
        console.error('Error al enviar el pedido:', emailError);
        showNotification('❌ Error al enviar el pedido. Por favor intenta de nuevo.');
    }

    // Show thank you modal
    showThankYouModal();

    // Clear cart after 2 seconds
    setTimeout(() => {
        cart = [];
        saveCartToStorage();
        updateCart();
        updateCartBadge();
        document.getElementById('customerName').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('customerDistrict').value = '';
        document.getElementById('customerAddress').value = '';
        document.getElementById('customerReference').value = '';
        document.getElementById('customerComments').value = '';
        document.getElementById('paymentMethod').value = '';
        document.getElementById('customerCoordinates').value = '';
        
        // Reset payment button styles
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Reset view
        hideCheckoutForm();
    }, 2000);
}

/**
 * Show notification message
 * @param {string} message - Message to display
 */
function showNotification(message) {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, CONFIG.notification.displayDuration);
}

/**
 * Initialize cart event listeners
 */
export function initCart() {
    // Load cart from storage first
    loadCartFromStorage();
    
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const districtInput = document.getElementById('customerDistrict');
    const addressInput = document.getElementById('customerAddress');

    if (nameInput) nameInput.addEventListener('input', checkFormValidity);
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            // Allow only numbers
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            // Limit to 9 digits
            if (e.target.value.length > 9) {
                e.target.value = e.target.value.slice(0, 9);
            }
            checkFormValidity();
        });
    }
    if (districtInput) districtInput.addEventListener('change', checkFormValidity);
    if (addressInput) addressInput.addEventListener('input', checkFormValidity);

    updateCart();
    updateCartBadge();
}

// Make cart functions available globally for onclick handlers
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.showCheckoutForm = showCheckoutForm;
window.hideCheckoutForm = hideCheckoutForm;
window.finalizeOrder = finalizeOrder;
window.selectPaymentMethod = selectPaymentMethod;
window.showPaymentReminder = showPaymentReminder;
window.hidePaymentReminder = hidePaymentReminder;
window.closeThankYouModal = closeThankYouModal;
window.showSection = showSection;
