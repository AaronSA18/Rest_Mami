/**
 * Geolocation Module
 * Burger & Broaster Express
 * 
 * Interactive geolocation system using Leaflet.js and OpenStreetMap
 * Allows address search (Nominatim), GPS detection, and manual map selection
 * 
 * Performance optimized for >90% Lighthouse score
 */

import { CONFIG } from '../config.js';

// Global state
let map = null;
let marker = null;
let customerLocation = {
  lat: null,
  lng: null,
  address: '',
};

// Internal logging helper
function logStatus(message, type = 'info') {
  console.log(`[Geolocation ${type.toUpperCase()}] ${message}`);
}

/**
 * Initialize Leaflet map
 * Called when checkout form becomes visible
 */
function initMap() {
  // Prevent duplicate initialization
  if (map !== null) return;

  try {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
      console.warn('Leaflet not loaded yet, retrying...');
      setTimeout(initMap, 500);
      return;
    }

    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.warn('Map container not found');
      return;
    }

    // Initialize map with Lima as center
    const [centerLat, centerLng] = CONFIG.geolocation.defaultCenter;
    map = L.map('map').setView([centerLat, centerLng], CONFIG.geolocation.zoomLevel);

    // Add OpenStreetMap tile layer
    L.tileLayer(CONFIG.geolocation.tileLayer, {
      attribution: CONFIG.geolocation.attribution,
      maxZoom: 19,
    }).addTo(map);

    // Add click handler to map
    map.on('click', function (e) {
      setMarker(e.latlng.lat, e.latlng.lng);
    });

    // Place default marker at center
    setMarker(centerLat, centerLng);

    console.log('✅ Map initialized successfully');
  } catch (error) {
    console.error('Error initializing map:', error);
    logStatus('Error al cargar el mapa', 'error');
  }
}

/**
 * Set or update marker on map
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
function setMarker(lat, lng) {
  try {
    if (!map) return;

    // Remove existing marker
    if (marker) {
      map.removeLayer(marker);
    }

    // Create draggable marker
    marker = L.marker([lat, lng], {
      draggable: true,
    }).addTo(map);

    // Update marker on drag
    marker.on('dragend', function () {
      const pos = marker.getLatLng();
      updateLocation(pos.lat, pos.lng);
    });

    // Center map on marker
    map.setView([lat, lng], CONFIG.geolocation.zoomLevel);

    // Update location data
    updateLocation(lat, lng);
  } catch (error) {
    console.error('Error setting marker:', error);
  }
}

/**
 * Update location data and reverse geocode
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
async function updateLocation(lat, lng) {
  try {
    customerLocation.lat = lat;
    customerLocation.lng = lng;

    // Update hidden coordinates input
    const coordsInput = document.getElementById('customerCoordinates');
    if (coordsInput) {
      coordsInput.value = `${lat},${lng}`;
      coordsInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Perform reverse geocoding
    await reverseGeocode(lat, lng);
  } catch (error) {
    console.error('Error updating location:', error);
  }
}

/**
 * Search address using Nominatim API
 * First validates that district is selected
 */
async function searchAddress() {
  try {
    const districtSelect = document.getElementById('customerDistrict');
    const searchInput = document.getElementById('geo-search');

    // Validate district selection
    if (!districtSelect || !districtSelect.value) {
      logStatus('Selecciona un distrito primero', 'error');
      return;
    }

    if (!searchInput || !searchInput.value.trim()) {
      logStatus('Ingresa una dirección', 'error');
      return;
    }

    const query = searchInput.value.trim();
    logStatus('🔍 Buscando dirección...', 'info');

    // Call Nominatim API
    const response = await fetch(
      `${CONFIG.geolocation.nominatimBaseUrl}/search?` +
      `q=${encodeURIComponent(query)},Lima,Peru&format=json&limit=1`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const results = await response.json();

    if (results.length === 0) {
      logStatus('No se encontró la dirección', 'error');
      return;
    }

    const result = results[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    setMarker(lat, lng);
    logStatus('✅ Dirección encontrada', 'success');
  } catch (error) {
    console.error('Error searching address:', error);
    logStatus('Error al buscar dirección', 'error');
  }
}

/**
 * Get current location using browser Geolocation API
 */
async function getCurrentLocation() {
  try {
    if (!navigator.geolocation) {
      logStatus('Geolocalización no disponible en tu navegador', 'error');
      return;
    }

    logStatus('📍 Obteniendo ubicación...', 'info');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMarker(latitude, longitude);
        logStatus('✅ Ubicación obtenida', 'success');
      },
      (error) => {
        console.error('Geolocation error:', error);
        let message = 'Error al obtener ubicación';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Permiso de ubicación denegado';
        }
        logStatus(message, 'error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  } catch (error) {
    console.error('Error getting current location:', error);
    logStatus('Error al obtener ubicación', 'error');
  }
}

/**
 * Reverse geocode coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `${CONFIG.geolocation.nominatimBaseUrl}/reverse?` +
      `format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Build address string
    let address = '';
    if (data.address) {
      const { road, house_number, neighbourhood, suburb, city } = data.address;
      address = [house_number, road, neighbourhood || suburb].filter(Boolean).join(', ');
    }

    if (!address) {
      address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    // Store address in customerLocation for later use
    customerLocation.address = address;

    // Update hidden address field
    const addressField = document.getElementById('customerAddress');
    if (addressField) {
      addressField.value = address;
      addressField.dispatchEvent(new Event('change', { bubbles: true }));
    }

    console.log('✅ Dirección detectada:', address);
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    const addressField = document.getElementById('customerAddress');
    if (addressField) {
      addressField.value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
}

/**
 * Enable/disable address search based on district selection
 */
function handleDistrictChange() {
  const districtSelect = document.getElementById('customerDistrict');
  const geoSearchInput = document.getElementById('geo-search');

  if (geoSearchInput) {
    if (districtSelect && districtSelect.value) {
      geoSearchInput.disabled = false;
      geoSearchInput.placeholder = 'Ingresa tu dirección...';
    } else {
      geoSearchInput.disabled = true;
      geoSearchInput.placeholder = 'Selecciona un distrito primero';
      geoSearchInput.value = '';
    }
  }
}

/**
 * Initialize geolocation when checkout form becomes visible
 */
export function initializeGeolocation() {
  const checkoutForm = document.getElementById('checkout-form');
  if (!checkoutForm) {
    console.warn('Checkout form not found');
    return;
  }

  // Set up event listeners
  const districtSelect = document.getElementById('customerDistrict');
  const geoSearchBtn = document.getElementById('geo-search-btn');
  const geoGpsBtn = document.getElementById('geo-gps-btn');
  const geoSearchInput = document.getElementById('geo-search');

  if (districtSelect) {
    districtSelect.addEventListener('change', handleDistrictChange);
  }

  if (geoSearchInput) {
    geoSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchAddress();
      }
    });
  }

  if (geoSearchBtn) {
    geoSearchBtn.addEventListener('click', searchAddress);
  }

  if (geoGpsBtn) {
    geoGpsBtn.addEventListener('click', getCurrentLocation);
  }

  // Initialize map if form is already visible
  const isAlreadyVisible = checkoutForm.style.display !== 'none' &&
    window.getComputedStyle(checkoutForm).display !== 'none';
  if (isAlreadyVisible && map === null) {
    initMap();
  }

  // Use MutationObserver to detect when the form becomes visible later
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const isVisible = checkoutForm.style.display !== 'none' &&
          window.getComputedStyle(checkoutForm).display !== 'none';

        if (isVisible && map === null) {
          console.log('Checkout form is visible, initializing map...');
          initMap();
        }
      }
    });
  });

  observer.observe(checkoutForm, {
    attributes: true,
    attributeFilter: ['style'],
  });

  console.log('✅ Geolocation system initialized');
}

/**
 * Export customerLocation for use in other modules
 */
export function getCustomerLocation() {
  return customerLocation;
}

/**
 * Export function to trigger search from external code
 */
export function triggerAddressSearch() {
  searchAddress();
}

/**
 * Export function to trigger GPS from external code
 */
export function triggerGPS() {
  getCurrentLocation();
}
