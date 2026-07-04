/**
 * Configuration File - Optimized
 * Burger & Broaster Express
 *
 * Global configuration and constants
 * Performance: Removed console warnings in production, optimized env access
 */

const env = (key) => import.meta.env[key] || "";

// Only warn in development mode
if (import.meta.env.DEV) {
  const required = [
    "VITE_EMAILJS_SERVICE_ID",
    "VITE_EMAILJS_TEMPLATE_ID",
    "VITE_EMAILJS_PUBLIC_KEY",
    "VITE_EMAILJS_BUSINESS_EMAIL",
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY"
  ];
  
  const missing = required.filter(key => !env(key));
  if (missing.length > 0) {
    console.warn(`Missing env vars: ${missing.join(', ')}`);
  }
}

export const CONFIG = {
  emailjs: {
    serviceId: env("VITE_EMAILJS_SERVICE_ID"),
    templateId: env("VITE_EMAILJS_TEMPLATE_ID"),
    publicKey: env("VITE_EMAILJS_PUBLIC_KEY"),
    businessEmail: env("VITE_EMAILJS_BUSINESS_EMAIL"),
  },

  carousel: {
    itemGap: 32,
    transitionDuration: 500,
    autoScrollDelay: 5000,
  },

  notification: {
    displayDuration: 3000,
  },
};
