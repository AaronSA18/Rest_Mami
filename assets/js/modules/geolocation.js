/**
 * Geolocation Module
 * Burger & Broaster Express
 * 
 * Manual address entry module. 
 * Prevents address entry until a district is selected and synchronizes 
 * the visible input with a hidden field for order processing.
 * 
 * Performance optimized for >90% Lighthouse score
 */

import { CONFIG } from '../config.js';

// Global state
let customerLocation = {
  lat: null,
  lng: null,
  address: '',
};

// Internal logging helper
function logStatus(message, type = 'info') {
  console.log(`[Geolocation ${type.toUpperCase()}] ${message}`);
  showNotification(message);
}

/**
 * Show notification helper (matches main notification style)
 */
function showNotification(message) {
  const notification = document.getElementById('notification');
  if (!notification) return;

  notification.textContent = message;
  notification.classList.add('show');

  const duration = (CONFIG.notification && CONFIG.notification.displayDuration) || 3000;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, duration);
}

/**
 * Enable/disable address input based on district selection
 */
function handleDistrictChange() {
  const districtSelect = document.getElementById('customerDistrict');
  const geoSearchInput = document.getElementById('geo-search');

  const isDisabled = !districtSelect || !districtSelect.value;

  if (geoSearchInput) {
    geoSearchInput.disabled = isDisabled;
    if (isDisabled) {
      geoSearchInput.value = '';
      syncManualAddress('');
    }
  }
}

/**
 * Keep the hidden customerAddress input in sync with the visible manual input
 */
function syncManualAddress(value) {
  const addressField = document.getElementById('customerAddress');
  if (addressField) {
    addressField.value = value;
    addressField.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

/**
 * Initialize geolocation when checkout form becomes visible
 */
export function initializeGeolocation() {
  const checkoutForm = document.getElementById('checkout-form');
  if (!checkoutForm) return;

  const districtSelect = document.getElementById('customerDistrict');
  const geoSearchInput = document.getElementById('geo-search');

  // District change handler
  if (districtSelect) {
    districtSelect.addEventListener('change', handleDistrictChange);
  }

  // Manual input sync + district warning
  if (geoSearchInput) {
    geoSearchInput.addEventListener('input', (e) => syncManualAddress(e.target.value));

    const showDistrictWarning = () => {
      const ds = document.getElementById('customerDistrict');
      if (!ds || !ds.value) {
        logStatus('📌 Primero selecciona un distrito', 'warning');
      }
    };

    geoSearchInput.addEventListener('click', showDistrictWarning);
    geoSearchInput.addEventListener('focus', showDistrictWarning);
  }

  // Set initial state
  handleDistrictChange();
}

/**
 * Export customerLocation for use in other modules
 */
export function getCustomerLocation() {
  return customerLocation;
}

/**
 * Export function to trigger search (no-op)
 */
export function triggerAddressSearch() {
  // Logic removed
}

/**
 * Export function to trigger GPS (no-op)
 */
export function triggerGPS() {
  // Logic removed
}
