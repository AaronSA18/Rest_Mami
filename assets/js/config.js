/**
 * Configuration File
 * Burger & Broaster Express
 *
 * Global configuration and constants
 */

export const CONFIG = {
  // EmailJS Configuration for Order Notifications
  emailjs: {
    serviceId: "service_2opd7vp",
    templateId: "template_4bl7von",
    publicKey: "MuH16VnihKaVvx7a2",
    businessEmail: "info@burgerbroaster.pe", // Business email for order notifications
  },

  // Carousel Configuration
  carousel: {
    itemGap: 32, // Gap between items in pixels (2rem)
    transitionDuration: 500, // Transition duration in milliseconds
    autoScrollDelay: 5000, // Auto scroll delay (if implemented)
  },

  // Notification Configuration
  notification: {
    displayDuration: 3000, // Duration to show notifications in milliseconds
  },

  // Geolocation Configuration
  geolocation: {
    defaultCenter: [-12.0464, -77.0428], // Lima, Peru [lat, lng]
    zoomLevel: 15,
    tileLayer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '© OpenStreetMap contributors',
    nominatimBaseUrl: "https://nominatim.openstreetmap.org",
    googleMapsBaseUrl: "https://www.google.com/maps",
  },

  // Image Paths
  images: {
    basePath: "assets/images/",
    broaster: "assets/images/broaster/",
    hamburguesas: "assets/images/hamburguesas/",
    salchipapas: "assets/images/salchipapas/",
    bebidas: "assets/images/bebidas/",
    combos: "assets/images/combos/",
  },
};
