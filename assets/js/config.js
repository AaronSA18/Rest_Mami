/**
 * Configuration File
 * Burger & Broaster Express
 *
 * Global configuration and constants
 */

const env = (key) => import.meta.env[key] || "";

if (
  !env("VITE_EMAILJS_SERVICE_ID") ||
  !env("VITE_EMAILJS_TEMPLATE_ID") ||
  !env("VITE_EMAILJS_PUBLIC_KEY") ||
  !env("VITE_EMAILJS_BUSINESS_EMAIL") ||
  !env("VITE_SUPABASE_URL") ||
  !env("VITE_SUPABASE_ANON_KEY")
) {
  console.warn(
    "Faltan variables de entorno. Copia .env.example a .env.local y completa los valores.",
  );
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
